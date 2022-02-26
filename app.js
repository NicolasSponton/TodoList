const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const workItems = [];

//Connect to the Data Base
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

//Define items schemas and default items
const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Study Node.js"
});

const item2 = new Item({
  name:"Continue Web Project"
});

const item3 = new Item({
  name:"Do homework"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemSchema]
}

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find({},(err,results)=>{

    if(err){
      console.log(err);
    }else{
      if(results.length === 0){
        Item.insertMany(defaultItems,(err)=>{
          if(err){
            console.log(err);
          }else{
            console.log("successfully added default items");
          }
        });
        res.redirect("/");
      }else{
        const day = date.getDate();
        res.render("list", {listTitle: day, newListItems: results});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name:itemName
  });

  if(req.body.list === date.getDate()){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:req.body.list},(err,result)=>{
      result.items.push(item);
      result.save();
      res.redirect("/" + req.body.list)
    });
  }
  
});

app.post("/delete",(req,res)=>{
  
  if(req.body.list === date.getDate()){
    Item.findByIdAndRemove(req.body.checkbox,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:req.body.list},{$pull:{items:{_id:req.body.checkbox}}},(err,result)=>{
      if(!err){
        res.redirect("/" + req.body.list);
      }else{
        console.log(err);
      }
    })
  }


})

app.get("/:list", function(req,res){

  const listAdress = lodash.capitalize(req.params.list);

  List.findOne({name:listAdress},(err,result)=>{
    if(!result){
      const list = new List({
        name:listAdress,
        items:defaultItems
      });
    
      list.save();
      res.redirect("/"+listAdress);
    }else{
      res.render("list", {listTitle: listAdress, newListItems: result.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
