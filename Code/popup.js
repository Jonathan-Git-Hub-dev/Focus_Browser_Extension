"use strict";

//references for css classes, used to programmatically style new elements
const pol = document.getElementById("ref_pol");
const c1 = document.getElementById("ref_c1");
const holdDay = document.getElementById("ref_holdDay");
const c2on = document.getElementById("ref_c2on");
const c2off = document.getElementById("ref_c2off");
const holdButton = document.getElementById("ref_holdButton");
const b1 = document.getElementById("ref_b1");
const holdTime = document.getElementById("ref_holdTime");
const c3 = document.getElementById("ref_c3");
const bOff = document.getElementById("bOff");
const bOn = document.getElementById("bOn");
const breakR = document.getElementById("ref_break");


//tracks user chosen days when editing and creating policies
var checkedDays = [false,false,false,false,false,false,false];

//functions for working with day button inputs
function resetDays()
{
    for(let i=0; i<7; i++)
    {
        checkedDays[i] = false;
    }
}
function turnOnDay(id)
{
    var b = document.getElementById(id);
    b.classList = bOn.classList;
}
function turnOffDay(id)
{
    var b = document.getElementById(id);
    b.classList = bOff.classList;
}
function swicthDay(id, num)
{
    if(checkedDays[num-1] == false)
    {
        turnOnDay(id);
        checkedDays[num-1] = true;
        return
    }
    turnOffDay(id)
    checkedDays[num-1] = false;
}

function newPolicyDiv(np)//creates policy divs for display, gives then delete and edit capabilities
{
    const container = document.createElement("div");//highest level div containing all other to be created
    container.classList = pol.classList;
    container.id = np.id;

    const url = document.createElement("div");
    url.classList = c1.classList;
    url.innerHTML=np.url;

    const days = document.createElement("div");//holds all day elements
    days.classList = holdDay.classList;

    const d1 = document.createElement("div");
    d1.classList = (np.d[0] ? c2on.classList : c2off.classList);
    d1.innerHTML = "M";
    const d2 = document.createElement("div");

    d2.classList = (np.d[1] ? c2on.classList : c2off.classList); 
    d2.innerHTML = "T";
    const d3 = document.createElement("div");
    d3.classList = (np.d[2] ? c2on.classList : c2off.classList);
    d3.innerHTML = "W";
    const d4 = document.createElement("div");
    d4.classList = (np.d[3] ? c2on.classList : c2off.classList);
    d4.innerHTML = "T";
    const d5 = document.createElement("div");
    d5.classList = (np.d[4] ? c2on.classList : c2off.classList);
    d5.innerHTML = "F";
    const d6 = document.createElement("div");
    d6.classList = (np.d[5] ? c2on.classList : c2off.classList);
    d6.innerHTML = "S";
    const d7 = document.createElement("div");
    d7.classList = (np.d[6] ? c2on.classList : c2off.classList);
    d7.innerHTML = "S";

    const buttons = document.createElement("div");//holds all buttons
    buttons.classList = holdButton.classList;

    const bR = document.createElement("BUTTON");
    bR.classList = b1.classList;
    bR.innerHTML = "Remove";
    const bE = document.createElement("BUTTON");
    bE.classList = b1.classList;
    bE.innerHTML = "Edit";


    const times = document.createElement("div");//hold time elements
    times.classList = holdTime.classList;

    const t1 = document.createElement("div");
    t1.classList = c3.classList;
    t1.innerHTML = np.t1

    const t2 = document.createElement("div");
    t2.classList = c3.classList;
    t2.innerHTML = np.t2

    bR.onclick = function(){//deletes policy
        let temp = np.id;

        //may be removing a policy that is currently being edited
        if(document.getElementById("pol2").style.display == "block")
        {//if so stop allowing it to be edited
            if(temp == document.getElementById("id_holder").value)
            {
                console.log("removing one that is being edited");
                hide_create();
            }
        }
        
        container.remove();//remove form display

        chrome.storage.local.get(["policies"]).then((result) => {//remove from storage
            let arr = result.policies;
            for (let i = 0; i < arr.length; i++)
            {
                //found element
                if(arr[i].id == temp) 
                {
                    //remove
                    arr.splice(i, 1);

                    //save new array (does not contain old policy)
                    if(arr.length == 0)
                    {
                        chrome.storage.local.clear();
                    }
                    else
                    {
                        chrome.storage.local.set({ policies : arr });   
                    }
                    break;
                }
            }
        });
	};


    bE.onclick = async function(){//enables editing

        document.getElementById("active_policies").style.height = 240;//shrink display for more room for editing
        document.getElementById("create").style.display = "none";

        let data;
        document.getElementById("errors").innerHTML = "";

        await chrome.storage.local.get(["policies"]).then((result) => {//get data of policy
            let arr = result.policies;
            for (let i = 0; i < arr.length; i++)
            {
                //found element
                if(arr[i].id == np.id) 
                {
                    data = arr[i];
                    //console.log(data);
                    break;
                }
            }
        });
        
        //move data into edit window's policy display for user reference
        document.getElementById("id_holder").value = data.id;
        document.getElementById("ref_c1").innerHTML = data.url;
        document.getElementById("dd1").classList = (data.d[0] ? c2on.classList : c2off.classList);
        document.getElementById("dd2").classList = (data.d[1] ? c2on.classList : c2off.classList);
        document.getElementById("dd3").classList = (data.d[2] ? c2on.classList : c2off.classList);
        document.getElementById("dd4").classList = (data.d[3] ? c2on.classList : c2off.classList);
        document.getElementById("dd5").classList = (data.d[4] ? c2on.classList : c2off.classList);
        document.getElementById("dd6").classList = (data.d[5] ? c2on.classList : c2off.classList);
        document.getElementById("dd7").classList = (data.d[6] ? c2on.classList : c2off.classList);
        document.getElementById("dt1").innerHTML = data.t1;
        document.getElementById("dt2").innerHTML = data.t2;
        //display policy reference
        document.getElementById("pol2").style.display = "block";



        //move data into create policy display for user input 
        document.getElementById("website").value = data.url;
        
        //save day states in array
        for(let i =0; i<7; i++)
        {
            if(data.d[i] == true)
            {
                checkedDays[i] = true;
            }
            else
            {
                checkedDays[i] = false;
            }
        }
        document.getElementById("d1").classList = (data.d[0] ? bOn.classList : bOff.classList);
        document.getElementById("d2").classList = (data.d[1] ? bOn.classList : bOff.classList);
        document.getElementById("d3").classList = (data.d[2] ? bOn.classList : bOff.classList);
        document.getElementById("d4").classList = (data.d[3] ? bOn.classList : bOff.classList);
        document.getElementById("d5").classList = (data.d[4] ? bOn.classList : bOff.classList);
        document.getElementById("d6").classList = (data.d[5] ? bOn.classList : bOff.classList);
        document.getElementById("d7").classList = (data.d[6] ? bOn.classList : bOff.classList);
        document.getElementById("t1").value = data.t1;
        document.getElementById("t2").value = data.t2;
        document.getElementById("create_create").style.display = "none";
        document.getElementById("edit").style.display = "block";
        document.getElementById("create_policies").style.display = "block";
    };


    //structure all element is container
    days.appendChild(d1);
    days.appendChild(d2);
    days.appendChild(d3);
    days.appendChild(d4);
    days.appendChild(d5);
    days.appendChild(d6);
    days.appendChild(d7);
    times.appendChild(t1);
    times.appendChild(t2);
    buttons.appendChild(bR);
    buttons.appendChild(bE);
    container.appendChild(url);
    container.appendChild(days);
    const br = document.createElement("div");
    br.classList = breakR.classList;
    container.appendChild(br);
    container.appendChild(buttons);
    container.appendChild(times);
    
    //add finished policy to screen
    document.getElementById("active_policies").appendChild(container);
}

//displays create box for policy
function show_create()
{
    //remove all previous data
    document.getElementById("pol2").style.display = "none";
    document.getElementById("active_policies").style.height = 320;
    document.getElementById("errors").innerHTML = "";
    document.getElementById("website").value = "";
    turnOffDay("d1");
    turnOffDay("d2");
    turnOffDay("d3");
    turnOffDay("d4");
    turnOffDay("d5");
    turnOffDay("d6");
    turnOffDay("d7");
    resetDays();
    document.getElementById("t1").value = "";
    document.getElementById("t2").value = "";


    //remove/hide confirm edit button
    document.getElementById("edit").style.display = "none";

    //display screen
    document.getElementById("create_policies").style.display = "block";
    
    //show confirm edit button
    document.getElementById("create_create").style.display = "block";
    document.getElementById("create").style.display = "none";
}

function hide_create()//hides create panel
{
    document.getElementById("active_policies").style.height = 400;
    document.getElementById("create_policies").style.display = "none";
    document.getElementById("create").style.display = "block";
    document.getElementById("pol2").style.display = "none";
}

function input_check(url, t1, t2)//validation
{
    if(url == "" || t1 == "" || t2 == "")//blank inputs
    {
        document.getElementById("errors").innerHTML = "Blank inputs";
        return false;
    }

    let dayCheck = false//policy needs to exist on at least a single day of the week
    for(let i =0; i < 7; i++)
    {
        if(checkedDays[i] == true)
        {
            dayCheck = true;
            break;
        }
    }

    if(!dayCheck)
    {
        document.getElementById("errors").innerHTML = "no day selected";
        return false;
    }

    let t1a = t1.split(":");//making sure start time comes before end time
    let t2a = t2.split(":");
    let t1h = parseInt(t1a[0]);
    let t1m = parseInt(t1a[1]);
    let t2h = parseInt(t2a[0]);
    let t2m = parseInt(t2a[1]);

    if(t1h > t2h) 
    {
        document.getElementById("errors").innerHTML = "time range impossible1";
        return false;
    }

    if(t1h == t2h && t1m >= t2m)
    {
        document.getElementById("errors").innerHTML = "time range impossible1";
        return false;
    }

    document.getElementById("errors").innerHTML = "";//data in correct format
    return true;
}


function create_policy()//add policy to record
{
    let url = document.getElementById("website").value;

    const np = {id: 0,//policy object
        url : url,
        d: checkedDays,
        t1 : document.getElementById("t1").value,
        t2 : document.getElementById("t2").value};

    //validate data
    if(input_check(url, np.t1, np.t2) == false)
    {
        return;
    }

    
    let idx;//get unique identifier for new policy
    chrome.storage.local.get(["index"]).then((result) => {
        if(result.index === undefined)
        {
            idx = 0;
        }
        else
        {
            idx = result.index+1;
            np.id = idx;
        }
        //update
        chrome.storage.local.set({ index : idx });

        newPolicyDiv(np);//display with other policies
        JSON.stringify(np);
        
        chrome.storage.local.get(["policies"]).then((result) => {//save policy
            let arr = [];
            if(result.policies === undefined)
            {
            
            }
            else
            {
                arr = result.policies;
            }
            arr.push(np);
            
            chrome.storage.local.set({ policies : arr });
        });
    });
}

function editer()//saves edited values in original policy
{
    let idx = document.getElementById("id_holder").value;
    let url = document.getElementById("website").value;
    let t1 = document.getElementById("t1").value;
    let t2 = document.getElementById("t2").value;

    if(input_check(url, t1, t2) == false)//re-validate
    {
        return;
    }
    
    chrome.storage.local.get(["policies"]).then((result) => {
        let arr = result.policies;
        let index = 0
        for (let i = 0; i < arr.length; i++)
        {
            if(arr[i].id == idx)//find index in array using unique identifier
            {
                index = i;
                break;
            }
        }
        
        //change array to new data
        arr[index].url = document.getElementById("website").value;
        arr[index].d = checkedDays;
        arr[index].t1 = document.getElementById("t1").value;
        arr[index].t2 = document.getElementById("t2").value; 
        
        //save new data to chrome storage
        chrome.storage.local.set({ policies : arr })//.then(() => {});
        
        //edit displayed values
        const collection = document.getElementById(idx).children;
        collection[0].innerHTML = arr[index].url;
        collection[1].children[0].classList = (arr[index].d[0] ? c2on.classList : c2off.classList);
        collection[1].children[1].classList = (arr[index].d[1] ? c2on.classList : c2off.classList);
        collection[1].children[2].classList = (arr[index].d[2] ? c2on.classList : c2off.classList);
        collection[1].children[3].classList = (arr[index].d[3] ? c2on.classList : c2off.classList);
        collection[1].children[4].classList = (arr[index].d[4] ? c2on.classList : c2off.classList);
        collection[1].children[5].classList = (arr[index].d[5] ? c2on.classList : c2off.classList);
        collection[1].children[6].classList = (arr[index].d[6] ? c2on.classList : c2off.classList);
        collection[4].children[0].innerHTML = arr[index].t1;
        collection[4].children[1].innerHTML = arr[index].t2;

        //hide editor
        hide_create();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    //load policies form storage
    chrome.storage.local.get(["policies"]).then((result) => {
        if(result.policies === undefined)
        {
            
        }
        else
        {
            let arr = result.policies;
            for (let i = 0; i < arr.length; i++)
            {
                newPolicyDiv(arr[i])
            }
        }
    });
    
    //handle create div displaying
    document.getElementById("create").addEventListener('click', show_create);
    document.getElementById("create_hide").addEventListener('click', hide_create);
    
    //handle adding to creating
    document.getElementById("create_create").addEventListener('click', create_policy);
    //handle editing
    document.getElementById("edit").addEventListener('click', editer);

    //handling day buttons
    document.getElementById("d1").addEventListener("click", function() {
        swicthDay("d1", 1);
      });
    document.getElementById("d2").addEventListener("click", function() {
        swicthDay("d2", 2);
      });
    document.getElementById("d3").addEventListener("click", function() {
        swicthDay("d3", 3);
      });
    document.getElementById("d4").addEventListener("click", function() {
        swicthDay("d4", 4);
      });
    document.getElementById("d5").addEventListener("click", function() {
        swicthDay("d5", 5);
      });
    document.getElementById("d6").addEventListener("click", function() {
        swicthDay("d6", 6);
      });
    document.getElementById("d7").addEventListener("click", function() {
        swicthDay("d7", 7);
      });
});

