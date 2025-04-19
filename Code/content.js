"use strict"

async function sleep2(minutes) {//halts execution for a time
    return new Promise((resolve) => setTimeout(resolve, minutes * 1000 * 60));
}

var url = window.location.href;//current webpage
var instances = [];//tracks when the next policy takes place
var ret = 0;

var loaded = true;//blurring is destructive so if loaded not true, webpage needs reloading



//varialbes for tracking time
var minute;
var hour;
var day;
let newM, newH, newD;

function inPolicy(policy)//check if current time in the boundaries of the policy provided
{
    if(policy.d[day-1] == false)//policy does not include this day of the week so impossible
    {
        return false;
    }


    let t1a = policy.t1.split(":");
    let t2a = policy.t2.split(":");
    let t1h = parseInt(t1a[0]);
    let t1m = parseInt(t1a[1]);
    let t2h = parseInt(t2a[0]);
    let t2m = parseInt(t2a[1]);
    if(hour < t1h)
    {
        return false;
    }
    if(hour == t1h && minute < t1m)
    {
        return false;
    }
    if(hour > t2h)
    {
        return false
    }
    if(hour == t2h && minute > t2m)
    {
        return false;
    }
    return true;
}

function getStart(policy)//returns number of minutes till this policy begins
{//only policies that have not started are passed in
    let t1a = policy.t1.split(":");
    let t2a = policy.t2.split(":");
    let t1h = parseInt(t1a[0]);
    let t1m = parseInt(t1a[1]);
    let t2h = parseInt(t2a[0]);
    let t2m = parseInt(t2a[1]);

    if(policy.d[day-1] == false || (hour > t2h) || (hour == t2h && minute > t2m))
    {//start will not happen today so find the next valid day
        let index = day;
        let extras = 0;
        for(let i =0; i<7; i++)
        {
            if(index > 6)
            {
                index = 0;
            }
            if(policy.d[index])
            {
                extras = i;
                break;
            }

            index+=1
        }

        //start is rest of day + blank days + the time on the policy day until start
        let ret = 24*60 - hour*60 - minute;
        ret += (24*60*extras);
        ret += (t1h*60 + t1m)
        return ret;
    }

    let h = t1h - hour;
    let m = t1m - minute;

    return 60*h + m;
}

function getTime()//gets current time
{
    var cd = new Date(); 
    minute = cd.getMinutes();
    hour = cd.getHours();
    day = cd.getDay();
}

function getEnd(policy)//when in a policy return length in minutes of how long is left
{
    let t2a = policy.t2.split(":");
    let t2h = parseInt(t2a[0]);
    let t2m = parseInt(t2a[1]);

    let h = t2h - hour;
    let m = t2m - minute;

    return 60*h + m + 1;
}


async function handlePolicy(ret)//searches all policies and applies when relevant one found
{
    ret = 7*24*60;
    let check = false;
    let match = false;

    await chrome.storage.local.get(["policies"]).then((result) => {//get policies from storage
        let arr = [];
        if(result.policies === undefined)
        {
            ret = -1;//no policies at all so do nothing
        }
        else
        {
            arr = result.policies;
        
            for (let i = 0; i < arr.length; i++)
            {
                if(url.includes(arr[i].url))//policy is applicable (because current url includes policy url)
                {
                    match = true;
                    if(inPolicy(arr[i]))
                    {
                        if(check == false)
                        {
                            ret = 0;
                            check = true;//check means that we are in a policy as opposed to waiting for one to occur
                        }
                        ret = Math.max(ret, getEnd(arr[i]));
                    }
                    if(!check)//when we are not in a policy we find time till next one
                    {
                        ret = Math.min(ret, getStart(arr[i]));
                    }
                }
            }
        }
        if(!match)//no applicable polices so no more work to do
        {
            ret = -1;
        }


        if(check)//if in policy obscure webpage
        {
            document.body.innerHTML = "";
            document.getElementsByTagName('script').innerHTML = "";
            const a = document.createElement("div");
            a.innerHTML = "Webpage Blocked, come back later";
            a.style.backgroundColor = "black";
            a.style.color = "DarkTurquoise";
            document.body.appendChild(a);

            loaded = false;
        }
        else
        {//display page by reloading
            if(!loaded)
            {
                location.reload(); 
            }
        }
    });
    return ret;
}

function absoluteTime(extra, newM, newH, newD)//takes a number of minutes (extra) and add it to the current time, outputting when this many minutes have elapsed in day/hour/minute format
{
    newM = minute + (extra%60);

    newH = hour + (Math.floor((extra%(24*60))/60));

    newD = day + Math.floor(extra / (24*60));

    if(newM > 59)
    {
        newM -=60;
        newH +=1;
    }

    if(newH > 23)
    {
        newH -=24;
        newD +=1;
    }

    newD = newD%7;

    return  [newM, newH, newD];
}

function sameTime(ins)//has 'ins'(time) passed yet
{
    if(day < ins[2])
    {
        return false;
    }
    if(hour < ins[1])
    {
        return false;
    }
    if(minute < ins[0])
    {
        return false;
    }

    return true;
}


async function monitor()//structures all other routines to lay dormant till new policy event happens
{
    ret = 0;//minutes till we will check out policies again

    while(ret != -1)
    {    
        console.log(ret);
        await sleep2(ret);

        getTime();

        if(instances.length > 0)//instances store our next scheduled checks so if instances this may be a scheduled check no an interrupt driven check
        {
            if(sameTime(instances[0]))//remove form scheduled if currently processing
            {
                instances.splice(0, 1);
                console.log("probs routine not interupt edit/add driven");
            }
        }

        ret = await handlePolicy(ret);//get new break
        
        if(ret == -1)//ret == -1 means no policies or no applicable policies so no more work to do
        {
            break;
        }

        let arr = absoluteTime(ret, newM, newH, newD);//find when next change will happen
        newM = arr[0];
        newH = arr[1];
        newD = arr[2];

        if(instances.length > 0)//may already have work scheduled so no need to reschedule
        {
            if(instances[0] == newM && instances[1] == newH && instances[2] == newD)
            {//already have a handle on it
                ret = -1;
            }
            else//not scheduled
            {
                instances.push([newM, newH, newD]);
                instances.sort();
            }
        }
        else// not scheduled
        {
            instances.push([newM, newH, newD]);
        }
    }

    return;
}

monitor();//called when page loaded
chrome.storage.onChanged.addListener(monitor);//called on changes to polices