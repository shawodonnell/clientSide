//const ancestor = 'article'
//let results = document.evaluate(`//text()[contains(.,\'£\')]/ancestor::*[self::${ancestor}]`,document.body,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null)
resultsArray = [];

let results = document.evaluate(`//text()[contains(.,\'£\')]`,document.body,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null)

function start(){
    results = toArray(results);
    results = byLength(results);
    results = byAncestor(results[10]);
    results = byChildNodes(resultsArray)
    console.log(results);
    insertButtons(results);
}


//FUNCTIONS******************************************
//Change XPATH to Array
function toArray(results){
    let result = results.iterateNext();
    let resultsArray = []
    while(result){
        resultsArray.push(result);
        result = results.iterateNext();
    }
    return resultsArray   
}

//fILTER ARRAY by Length
function byLength(results){
    let resultsParsed = []    
    results.forEach(e => {
        if(e.length>=2 && e.length<10){
            resultsParsed.push(e)
        }
    }); 
    //console.log(resultsParsed);   
    return resultsParsed
}

//FILTER ARRAY by childNode Length
function byAncestor(node, previousCount=0){
    
    let currentCount = node.childNodes.length;

    //recursive killer
    if(node.parentElement.localName === 'main'){
        return
    }

    //filter childnodes
    if(node.localName !=='main'){
        if(currentCount>previousCount){
            let className = node.className;
            let nodeName = node.nodeName; 
            let count = node.childNodes.length;   
            resultsArray.push({className,nodeName,count})                   
        }       
        
        byAncestor(node.parentElement,currentCount)
        
    } 
}

function byChildNodes(array){
    let count = array[0].count
    let name = "";

    for (let i = 1; i < array.length; i++) {        
        
        if(array[i].count>count){
            count = array[i].count  
            name = array[i].className          
        } 
              
    }
    return name;
    
}

function insertButtons(results){

    if(results.includes(" ")){
        result = results.split(" ");
        result = result[0];
    } else {
        result = results
    }

    document.querySelector(`.${result}`).childNodes.forEach((e)=>{
        let span = document.createElement('span');
        let button = document.createElement('button')
            button.style.height = "20px"
            button.style.width = "20px"
            button.style.backgroundColor = "red"
            button.classList.add("tap_btn");
        span.appendChild(button);
        e.appendChild(span);
    })

}

document.onload = start();
/*ARCHIVE

//Traverse Ancestors
function ancestorList(node, previousCount=0){
    
    let className = node.parentElement.className;
    let nodeName = node.parentElement.nodeName;
    let parent = node.parentElement;
    let currentCount = node.parentElement.childElementCount;

    console.log("NODE:",node, node.className, node.nodeName);
    console.log("PARENT:", parent,currentCount);
    console.log(" ");

    if(parent.localName === 'main'){
        parent = null;
    }
    
    if(parent.localName !=='main'){
        if(previousCount>currentCount){
            console.log();                        
        }       
        
        ancestorList(parent,currentCount)
    } 

    return {className,nodeName,parent}
}

*/