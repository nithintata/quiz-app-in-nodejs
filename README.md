# Quiz App
A quiz app with admin privileges working on node js and mongodb

<h3><u>Problem Statement</u></h3><br>
<p>Create a quiz app for an educational institute where they can do following. </p>
<p>Admin should be able to create quiz with various instructions regarding the quiz, questions, answers, explanations and duration for the
quiz.</p>
<p>At any point of time admin can enable or disable the quiz itself.</p>
<p>At any point of time admin can enable or disable any question.</p>
<p>At any point of time admin can add, remove or edit the question for an existing quiz.</p>
<p>Apart from the admin rest of the users can only see the quiz and questions.</p>

<h3><u>Implementation</u></h3><br>
<p>1. The database schema for the above problem statement is located at<b><a href="models/quizes.js"> models/quizes.js</a></b> file</p>
<p>2. There are four different REST api's for performing various operations</p>
<ul>
<li> <b>localhost:3000/quizes</b>   --> for getting list of all quizes, creating a quiz, Removing all quizes </li>
<li> <b>localhost:3000/quizes/:quizId </b> --> for getting details of a quiz, updating content of a quiz, deleting a quiz </li>
<li> <b>localhost:3000/quizes/:quizId/questions </b> --> for getting questions of a quiz, adding a question, deleting all questions from quiz </li>
<li> <b>localhost:3000/quizes/:quizId/questions/:questionId</b> --> getting a question, updating a question, deleting a question </li>
</ul>
<p>3. The implementation of these end points can be found in <b><a href="routes/quizRouter.js">routes/quizRouter.js</a></b> file.</p>
<p>4. All the Post, Put, Delete operations needs to be authorized by providing username and password (username: admin, Password: password). 
This means only admin can create, update or delete a quiz/question </p>
<p>5. The implementation of authorization step can be found in <b><a href = "authenticate.js">authenticate.js</a></b> file in the root folder</p>
<p>6. Cookies are implemented to avoid the need of repeated authorization for admin</p>
<p>7. The user can only see the questions/quizes that are enabled by the admin. This is implemented by filtering the retrieved content from database by respective queries. </p>

<h3><u>Deployment steps</u></h3><br>
<ul>
<li>Clone the entire repository to a new folder on desktop</li>
<li>Open the command prompt from the same folder and type <b>npm install</b>. This will download all the required dependencies which are present in package.json file</li>
<li>Now open the mongodb terminal and create a new database named quiz. All the quizes and questions will be stored here.</li>
<li>All the logs will be stored in <b><a href = "logs/app.log"> logs/app.log</a></b> file</li>
<li>For doing unit tests type the command <b>npm run test</b>. This will do the unit tests on different end points for sanity checking.</li>
<li>To start the server enter the command <b>npm start</b></li>
</ul>
