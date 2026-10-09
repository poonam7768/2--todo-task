const cl = console.log;

const todoform = document.getElementById('todoform')
const todoInput = document.getElementById('todoInput')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const todocontainer = document.getElementById('todocontainer')
const spinner = document.getElementById('spinner')


const BASE_URL = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const TODO_URL = `${BASE_URL}todos.json`

let localstate = {
    todoArr : [],
    edit_todoId : null,
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}


function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        localstate.todoArr.unshift(obj[key])
    }
}


function makeApiCall(url,methodName,body=null){
    
    return fetch (url,{
        method:methodName,
        headers: {
            "content-type":"application/json",
            "auth":"JWT token"
        },
        body:body ? JSON.stringify(body) : null
    })
    .then(res =>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
}

function snackBar(msg,icon){
   Swal.fire({
    title:msg,
    timer:3000,
    icon:icon
   }) 

}

//read....!

function oncreate(){
    handleSpinner(true)
    makeApiCall(TODO_URL,"GET")
     .then(data=>{
        cl(data)
        objToArr(data)
        templiting(localstate.todoArr)
     })
     .catch(err=>{
        snackBar('something went wrong','error')
     })
     .finally(()=>{
        handleSpinner()
     })
}

function templiting(arr){
    let result = ``
    arr.forEach((todo)=>{
        result +=`<li id="${todo.id}" class="list-group-item d-flex justify-content-between mt-4">
                        <strong>${todo.todoItem}</strong>
                        <div>
                            <button onclick="onedit(this)" type="button" class="btn btn-sm btn-primary">Edit</button>
                            <button onclick="ondelete(this)" type="button" class="btn btn-sm btn-danger">Delete</button>
                        </div>
                    </li>`
    })
    todocontainer.innerHTML = result;
}
oncreate()

//create...!

function onAddTodo(eve){
    eve.preventDefault()
    let new_todoObj = {
        todoItem : todoInput.value,
    }
    handleSpinner(true)
    makeApiCall(TODO_URL,"POST",new_todoObj)
     .then(res=>{
        cl(res)
        new_todoObj.id = res.name
        localstate.todoArr.unshift(new_todoObj)
        templiting(localstate.todoArr)

    snackBar(`New todo Added Successfully !!`,'success')
     })
      .catch(err=>{
        snackBar(err,'error')
      })
      .finally(()=>{
        handleSpinner()
      })
}

//edit...!

function onedit(ele){
    let edit_id = ele.closest('li').id;
    localstate.edit_todoId = edit_id
    let editObj = localstate.todoArr.find(t=>t.id === edit_id)

    todoInput.value = editObj.todoItem

    addbtn.classList.add('d-none')
    updatebtn.classList.remove('d-none')

}

//updte....!
function onupdateTodo(eve){
    let update_id = localstate.edit_todoId;

    let updateUrl = `${BASE_URL}todos/${update_id}.json`

    let old_obj =  localstate.todoArr.find(t=> t.id === localstate.edit_todoId)
    let updatedObj = {
        todoItem : todoInput.value,
        id:update_id
    }
     handleSpinner(true)
     makeApiCall(updateUrl,"PATCH",updatedObj)
      .then(res => {
        let getIndex = localstate.todoArr.findIndex(t=> t.id === update_id)
        localstate.edit_todoId = null;
        localstate.todoArr[getIndex] = updatedObj ;
       templiting(localstate.todoArr)
       todoform.reset()
       addbtn.classList.remove('d-none')
       updatebtn.classList.add('d-none')
       snackBar("Todo Upadated Successfully !!!",'success')
      })
      .catch(err => {
        cl(err);
        snackBar("something went wrong !",'error')
      })
      .finally(()=>{
        handleSpinner()
      })
}



//delete...!!!

function ondelete(ele){
    let removeId = ele.closest('li').id
    
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
        }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
        let removeUrl = `${BASE_URL}todos/${removeId}.json`;
        makeApiCall(removeUrl,"DELETE")
         .then(res=>{
            let getIndex = localstate.todoArr.findIndex(t => t.id === removeId)
            localstate.todoArr.splice(getIndex,1)
            ele.closest('li').remove()
            snackBar(` Todo is Deleted Successfully !!!`,'success')
         })
         .catch(err=>{
            snackBar(err,'error')
         })
         .finally(()=>{
            handleSpinner()
         })
        }
    });

}


todoform.addEventListener("submit",onAddTodo)
updatebtn.addEventListener('click',onupdateTodo)