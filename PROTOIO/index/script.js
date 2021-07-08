

const quizUrl = "https://proto.io/en/jobs/candidate-exercise/quiz.json";
const resultUrl = "https://proto.io/en/jobs/candidate-exercise/result.json";
const submitStyle = "style='position: absolute;top: 85%;left: 50%;height: 45px;width: 85px;background: #48cfad;border: none;border-radius: 15px;box-shadow: 0 4px #999;color: #fff;font-weight: 500;font-size:16px;'";
var current_question = -1;
var selected = -1;
var total_score=0;
var correct_answers = -1;
initial_call();

// function that is called initialy or when the page is reloaded
function initial_call(){
    var request = new XMLHttpRequest();
    request.open('GET',quizUrl,true);
    //request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onload = function(){
      if(this.status== 200){
        var data = JSON.parse(this.responseText);
        document.getElementById('title').innerHTML = data.title;
        var output = "<p>"+data.description+"</p>";
        output = output + "<img src='images/underline_icon_2.png' class='underline-icon'>";
        output = output + "<button class='start-btn' id='start-btn' type='submit'>Start Quiz</button>";
        document.getElementById('center-box').innerHTML = output;
        document.getElementById('start-btn').addEventListener('click',startQuiz);
      }
    }
    request.onerror = function(){
      console.log('Request error...');
    }
    request.send("");
}









// ---------------- Creation of html elements ----------------
function printMultiplechoice(data){
  var output = "<div class='multiple-choice-box'>";
  for(let i of data.possible_answers){
    output = output + "<button id='"+i.a_id+"' value='"+i.a_id+"' class='not-selected'>"+i.caption+"</button>";
  }
  output = output + "</div>";
  return output;
}
function printTrueFalse(){
  var output = "<div class='truefalse-choice-box'>";
  output = output + "<button id='true' value='true' class='not-selected'>True</button>";
  output = output + "<button id='false' value='false' class='not-selected'>False</button>";
  output = output + "</div>";
  return output;
}
// --------------------------------------------------------












// ---------------- Button Action listeners ----------------
// button that starts the quiz
function startQuiz(){
  current_question = 0; // the current question is the first
  var request = new XMLHttpRequest();
  request.open('GET',quizUrl,true);
  request.onload = function(){
    if(this.status== 200){
      var data = JSON.parse(this.responseText);
      // find the number of questions
      const len = Object.keys(data.questions).length;
      // remove the extra information and keep only the current question
      data = data.questions[current_question];
      correct_answers = data.correct_answer;
      //console.log(data);
      // create all the html elements of that question
      var output = "<div class='question-box'>";
      output = output + "<p class='qest-num'>Question "+(current_question+1)+" out of "+len+"</p>";
      output = output + "<p>"+data.title+' ('+data.question_type+')'+"</p>";
      output = output + "<img src='"+data.img+"' class='question-image'>";
      // according to the type of question add the answer options
      if(data.question_type=="multiplechoice-single" || data.question_type=="multiplechoice-multiple"){
        output = output + printMultiplechoice(data);
      }else if(data.question_type=="truefalse"){
        output = output + printTrueFalse();
      }
      // check if we have another question or we have reached the last question
      if((current_question+1)==len){
        // end button
        output = output + "<button class='test' id='submit-btn' type='submit'"+submitStyle+">Submit Quiz</button>";
      }else{
        // next button
        output = output + "<button class='next-btn' id='next-btn' type='submit'>Next</button>";
      }
      output = output + "</div>";
      // add all the html elements to the page
      document.getElementById('center-box').innerHTML = output;
      // add action listeners for all the anwser options
      if(data.question_type=="truefalse"){
        document.getElementById('false').addEventListener('click',singleActionListener);
        document.getElementById('true').addEventListener('click',singleActionListener);
      }else{
        for(let i of data.possible_answers){
          if(data.question_type=="multiplechoice-multiple"){ // we care only the multiple corrent choices
            document.getElementById(i.a_id).addEventListener('click',multipleActionListener);
          }else{ // the are 2 possibilities need the same function
            document.getElementById(i.a_id).addEventListener('click',singleActionListener);
          }
        }
      }
      // Only one of those 2 will exists at our page
      if((current_question+1)==len){
        document.getElementById('submit-btn').addEventListener('click',submitQuiz);
      }else{
        document.getElementById('next-btn').addEventListener('click',nextQuestion);
      }
    }
  }
  request.onerror = function(){
    console.log('Request error...');
  }
  request.send("");
}




function multipleActionListener(){
  // if clicked mark it as clicked and don't care about previous
  //console.log('multipleActionListener');
  if(document.getElementById(this.value).className=='selected'){// click an option that was already clicked before
    document.getElementById(this.value).className='not-selected';
    // remove from the list of selected
    // the array "selected" it can't be equal with -1 because we had already clicked something before
    if(selected.length==1){
      selected=-1;
    }else{
      var index = selected.indexOf(this.value);
      if(index>-1){
        selected.splice(index, 1); // remove the value = this.value
      }
    }
  }else{ // we clicked a new one
    if(selected==-1){// this is the first
      selected = [];
      selected.push(this.value); // replace
      document.getElementById(this.value).className = 'selected';
    }else{ // this is not the first
      selected.push(this.value); // append
      document.getElementById(this.value).className = 'selected';
    }
  }
}





function singleActionListener(){
  // if clicked remove the previous click and mark the new one as clicked
  //console.log('singleActionListener');
  if(selected!=this.value){
    if(selected!=-1){
      document.getElementById(selected).className = document.getElementById(this.value).className;
    }
    document.getElementById(this.value).className = 'selected';
    selected = this.value;
  }
}




function nextQuestion(){
  if(selected!=-1){
    var html_to_insert="";
    if(Array.isArray(correct_answers)){
        var cor=1;
        for(let i of correct_answers){
          document.getElementById(i).className = 'correct';
          if(selected.indexOf(i.toString())<0){
            cor=0;
          }
        }
        if(correct_answers.length!=selected.length){
          cor=0;
        }
        if(cor==1){
          html_to_insert="<p class='score' style='font-weight: bold;color:#48cfad;position:absolute;left:0;top:90%;'>Correct! 1 point gained!</p>";
          total_score = total_score+1;
        }else{
          html_to_insert="<p class='score' style='font-weight: bold;color:#ed7161;position:absolute;left:0;top:90%;'>Wrong! 0 point gained!</p>";
          for(let i of selected){
            if(correct_answers.indexOf(parseInt(i))==-1){
              document.getElementById(i).className = 'wrong';
            }
          }
        }
    }else{
      document.getElementById(correct_answers).className = 'correct';
      if(selected.toString()==correct_answers.toString()){
        html_to_insert="<p class='score' style='font-weight: bold;color:#48cfad;position:absolute;left:0;top:90%;'>Correct! 1 point gained!</p>";
        total_score = total_score+1;
      }else{
        html_to_insert="<p class='score' style='font-weight: bold;color:#ed7161;position:absolute;left:0;top:90%;'>Wrong! 0 point gained!</p>";
        document.getElementById(selected).className = 'wrong';
      }
    }

    //document.getElementById('center-box').insertAdjacentHTML('beforeend', html_to_insert);
    document.getElementById('center-box').innerHTML+=html_to_insert; // we want the action listeners to be destroyed
    // display points gained
    // store total point gained
    setTimeout(function(){
      selected=-1;
      current_question = current_question + 1;
      var request = new XMLHttpRequest();
      request.open('GET',quizUrl,true);
      request.onload = function(){
        if(this.status== 200){
          var data = JSON.parse(this.responseText);
          const len = Object.keys(data.questions).length; // find the number of questions
          data = data.questions[current_question]; // remove the extra information and keep only the current question
          correct_answers = data.correct_answer;
          // create all the html elements of that question
          var output = "<div class='question-box'>";
          output = output + "<p class='qest-num'>Question "+(current_question+1)+" out of "+len+"</p>";
          output = output + "<p>"+data.title+' ('+data.question_type+')'+"</p>";
          output = output + "<img src='"+data.img+"' class='question-image'>";
          // according to the type of question add the answer options
          if(data.question_type=="multiplechoice-single" || data.question_type=="multiplechoice-multiple"){
            output = output + printMultiplechoice(data);
          }else if(data.question_type=="truefalse"){
            output = output + printTrueFalse(data);
          }
          // check if we have another question or we have reached the last question
          if((current_question+1)==len){
            // end button
            output = output + "<button class='submit-btn' id='submit-btn' type='submit'"+submitStyle+">Submit Quiz</button>";
          }else{
            // next button
            output = output + "<button class='next-btn' id='next-btn' type='submit'>Next</button>";
          }
          output = output + "</div>";
          // add all the html elements to the page
          document.getElementById('center-box').innerHTML = output;
          // add action listeners for all the anwser options
          if(data.question_type=="truefalse"){
            document.getElementById('false').addEventListener('click',singleActionListener);
            document.getElementById('true').addEventListener('click',singleActionListener);
          }else{
            for(let i of data.possible_answers){
              if(data.question_type=="multiplechoice-multiple"){ // we care only the multiple corrent choices
                document.getElementById(i.a_id).addEventListener('click',multipleActionListener);
              }else{ // the are 2 possibilities need the same function
                document.getElementById(i.a_id).addEventListener('click',singleActionListener);
              }
            }
          }
          // Only one of those 2 will exists at our page
          if((current_question+1)==len){
            document.getElementById('submit-btn').addEventListener('click',submitQuiz);
          }else{
            document.getElementById('next-btn').addEventListener('click',nextQuestion);
          }
        }
      }
      request.onerror = function(){
        console.log('Request error...');
      }
      request.send("");

    }, 3000); // 3 seconds
  }
}





function submitQuiz(){
  if(selected!=-1){
    var html_to_insert="";
    if(Array.isArray(correct_answers)){
        var cor=1;
        for(let i of correct_answers){
          document.getElementById(i).className = 'correct';
          if(selected.indexOf(i.toString())<0){
            cor=0;
          }
        }
        if(correct_answers.length!=selected.length){
          cor=0;
        }
        if(cor==1){
          html_to_insert="<p class='score' style='font-weight: bold;color:#48cfad;position:absolute;left:0;top:90%;'>Correct! 1 point gained!</p>";
          total_score = total_score+1;
        }else{
          html_to_insert="<p class='score' style='font-weight: bold;color:#ed7161;position:absolute;left:0;top:90%;'>Wrong! 0 point gained!</p>";
          for(let i of selected){
            if(correct_answers.indexOf(parseInt(i))==-1){
              document.getElementById(i).className = 'wrong';
            }
          }
        }
    }else{
      document.getElementById(correct_answers).className = 'correct';
      if(selected.toString()==correct_answers.toString()){
        html_to_insert="<p class='score' style='font-weight: bold;color:#48cfad;position:absolute;left:0;top:90%;'>Correct! 1 point gained!</p>";
        total_score = total_score+1;
      }else{
        html_to_insert="<p class='score' style='font-weight: bold;color:#ed7161;position:absolute;left:0;top:90%;'>Wrong! 0 point gained!</p>";
        document.getElementById(selected).className = 'wrong';
      }
    }

    //document.getElementById('center-box').insertAdjacentHTML('beforeend', html_to_insert);
    document.getElementById('center-box').innerHTML+=html_to_insert; // we want the action listeners to be destroyed
    // display points gained
    // store total point gained
    setTimeout(function(){
      selected=-1;
      current_question+=1;
      var percentage = (total_score/current_question)*100;
      var output = "<h1 style='position:absolute;color:#48cfad;top:-200px;left:35%;'>Quiz Result</h1><div style='width: 500px;height: 450px;border-style: solid;border-color: #48cfad;position:absolute;left:9%;top:-130px;border-radius:10%;'>";
      output+="<div style='height:3'>";
      output+="<table style='position:absolute;left:10%;top:15%;font-family:Arial,Helvetica,sans-serif;border-collapse: collapse;width: 80%;'>";
      output+="<tr><td style='border: 1px solid #ddd;padding: 8px;'>Total Questions</td><td style='border: 1px solid #ddd;padding: 8px;'>"+current_question+"</td></tr>";
      output+="<tr><td style='border: 1px solid #ddd;padding: 8px;'>Correct</td><td style='border: 1px solid #ddd;padding: 8px;'>"+total_score+"</td></tr>";
      output+="<tr><td style='border: 1px solid #ddd;padding: 8px;'>Wrong</td><td style='border: 1px solid #ddd;padding: 8px;'>"+(current_question-total_score)+"</td></tr>";
      output+="<tr><td style='border: 1px solid #ddd;padding: 8px;'>Percentage</td><td style='border: 1px solid #ddd;padding: 8px;'>"+percentage+"%</td></tr>";
      output+="<tr><td style='border: 1px solid #ddd;padding: 8px;'>Total Score</td><td style='border: 1px solid #ddd;padding: 8px;'>"+total_score+" / "+current_question+"</td></tr>";
      output+="</table>";
      var request = new XMLHttpRequest();
      request.open('GET',resultUrl,true);
      request.onload = function(){
        if(this.status== 200){
          var data = JSON.parse(this.responseText);
          for(let i of data.results){
            if(percentage==i.minpoints || (percentage>i.minpoints&&percentage<i.maxpoints) || percentage==i.maxpoints){
              output+="<h3 style='position:absolute;top:54%;left:10%;'>"+i.title+"</h3><p style='position:absolute;top:64%;left:10%;width:330px;'>"+i.message+"</p><img style='position:absolute;top:60%;left:77%;width:100px;height:100px;' src='"+i.img+"'>";
              break;
            }
          }
          output+="<button id='try-again-btn' style='position: absolute;top: 85%;left: 38%;height: 45px;width: 100px;background: #48cfad;border: none;border-radius: 15px;box-shadow: 0 4px #999;color: #fff;font-weight: 500;font-size:16px;'>Try Again</button>";
          output+="</div></div>";
          document.getElementById('center-box').innerHTML = output;
          document.getElementById('try-again-btn').addEventListener('click',tryAgain);
        }
      }
      request.onerror = function(){console.log('Request error...');}
      request.send("");
    }, 3000); // 3 seconds
  }
}





function tryAgain(){
  current_question = -1;
  selected = -1;
  total_score=0;
  correct_answers = -1;
  startQuiz();
}
// --------------------------------------------------------
