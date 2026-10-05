require('./config/env')
const mongoose=require('mongoose')
const {connectDatabase}=require('./config/db')
const Quiz=require('./models/Quiz')
const Question=require('./models/Question')
const quizzes=[
 {slug:'java-fundamentals',type:'Practice Quiz',title:'Java Fundamentals',description:'Build confidence with core Java syntax, operators, conditions, loops and object-oriented basics.',degree:'B.Tech',branch:'Computer Science & Engineering',subject:'Java',difficulty:'Easy',durationSeconds:1200,marks:20,negativeMarks:0,maxAttempts:3,isPublished:true,tags:['Java','Programming','Fundamentals']},
 {slug:'dsa-java',type:'Subject Test',title:'Data Structures & Algorithms with Java',description:'Test arrays, strings, searching, sorting, stacks, queues and core algorithmic thinking.',degree:'B.Tech',branch:'Computer Science & Engineering',subject:'DSA',difficulty:'Mixed',durationSeconds:1800,marks:30,negativeMarks:.25,maxAttempts:2,isPublished:true,tags:['DSA','Java','Placement']},
 {slug:'dbms-core',type:'Subject Test',title:'DBMS Core Concepts',description:'Check your understanding of databases, keys, normalization, SQL and transactions.',degree:'B.Tech',branch:'Computer Science & Engineering',subject:'DBMS',difficulty:'Medium',durationSeconds:1500,marks:25,negativeMarks:0,maxAttempts:3,isPublished:true,tags:['DBMS','SQL','Databases']}
]
const questionSets={
 'java-fundamentals':[
 ['Which keyword is used to inherit a class in Java?',['implements','extends','inherits','super'],'B'],
 ['Which data type stores a single 16-bit Unicode character?',['byte','char','short','String'],'B'],
 ['Which loop is guaranteed to execute its body at least once?',['for','while','do-while','enhanced for'],'C'],
 ['Which method is the entry point of a standard Java application?',['start()','run()','main()','execute()'],'C'],
 ['Which collection does not allow duplicate elements?',['List','Set','Queue','ArrayList'],'B']
 ],
 'dsa-java':[
 ['Which data structure follows LIFO order?',['Queue','Stack','Linked List','Heap'],'B'],
 ['What is the average time complexity of binary search on a sorted array?',['O(1)','O(log n)','O(n)','O(n log n)'],'B'],
 ['Which traversal visits a binary search tree in sorted order?',['Preorder','Postorder','Inorder','Level order'],'C'],
 ['Which sorting algorithm is stable in its standard implementation?',['Selection sort','Merge sort','Heap sort','Quick sort'],'B'],
 ['Which structure is commonly used for breadth-first search?',['Stack','Queue','Set only','Recursion stack'],'B']
 ],
 'dbms-core':[
 ['Which key uniquely identifies a row in a relational table?',['Foreign key','Primary key','Candidate value','Index only'],'B'],
 ['Which normal form removes partial dependency?',['1NF','2NF','3NF','BCNF'],'B'],
 ['Which SQL command is used to retrieve data?',['GET','SELECT','FETCHROW','READ'],'B'],
 ['A foreign key primarily establishes what?',['Sorting','A relationship between tables','Encryption','Compression'],'B'],
 ['Which property means a transaction is treated as an indivisible unit?',['Consistency','Isolation','Atomicity','Durability'],'C']
 ]
}
async function seed(){
 await connectDatabase(process.env.MONGODB_URI)
 for(const data of quizzes){
  const quiz=await Quiz.findOneAndUpdate({slug:data.slug},data,{upsert:true,new:true,setDefaultsOnInsert:true})
  await Question.deleteMany({quizId:quiz._id})
  for(let i=0;i<questionSets[data.slug].length;i++){
   const [text,options,correctOption]=questionSets[data.slug][i]
   await Question.create({quizId:quiz._id,position:i+1,text,options:options.map((t,index)=>({key:String.fromCharCode(65+index),text:t})),correctOption,marks:1})
  }
 }
 console.log('Quiz seed complete')
 await mongoose.disconnect()
}
seed().catch(error=>{console.error(error);process.exit(1)})
