//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");
const _ = require("lodash");
const { redirect } = require("express/lib/response");
const shopItems=[];
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect the mongoDB database with mongoose.
mongoose.connect("mongodb+srv://hamid:hamid@cluster0.fzbnf.mongodb.net/todolistDB");

const itemsShema = {
   name : String
}

const Item = mongoose.model("Item", itemsShema);

const item1 = new Item ({name: "Welcome to your todolist!"});
const item2 = new Item ({name: "Hit the + button to add a new item."})
const item3 = new Item ({name: "<-- Hit this to delete an item."})
const defaultItems = [item1, item2, item3];



app.get("/", function(req, res){

Item.find(function(err, results){

   if(results.length === 0){
      Item.insertMany(defaultItems, function(err){
         if(err){
            console.log(err);
         }else{
            console.log("Defeult values suceesfully inserted");
         }
      });
      res.redirect("/");
   }else{
      res.render('list', {listTitle: "Today", newElement: results});
   }
});
 });


 app.post("/", function(req, res){  
    
   
   const itemName = req.body.newItem;
   const listName = req.body.list; 
   const item4 = new Item ({name: itemName});

   if(listName==="Today"){
      item4.save();
      res.redirect("/");
   }else{
      List.findOne({name: listName}, function(err, foundList){
         foundList.items.push(item4);
         foundList.save();
         res.redirect("/"+listName);
      })
   }
   
});



app.post("/delete", function(req, res){
const listName= req.body.listName;

if(listName==="Today"){
   Item.findByIdAndRemove(req.body.on, function(err){
      if(err){
         console.log(err);
      }else{
         console.log("Deleted!")
            res.redirect("/")      
      }
   })
}else{
   List.findOneAndUpdate({name: listName},{$pull: {items:{_id: req.body.on}}}, function(err, foundList){
      if(!err){
         res.redirect("/"+ listName);
      }
   })
   
}
   
});

const listSchema = {
   name: String,
   items: [itemsShema]
}
const List = mongoose.model("List", listSchema);


// Added to solve an issue of favicon bein passed as a parameter in the below post request.
app.get('/favicon.ico', (req,res)=>{
   return 'your faveicon'
  })
  
app.get("/:listName", function(req, res){

   const userListName = _.capitalize(req.params.listName);

   // console.log(userListName);

List.findOne({name : userListName}, function(err, listExists){


   if(err){
      console.log(err)
   }else{
      if(listExists){
         res.render("list", {listTitle: listExists.name, newElement: listExists.items});
      }else{
         const list =new List({
              name: userListName,
              items: defaultItems});
            list.save();
         res.redirect("/"+userListName);
      }
   }

})

});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function(){
console.log("server started successfully");
});