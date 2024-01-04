const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'expenseTracker'
});


const expenseSchema = new mongoose.Schema({
    id: {type: Number, require: true},
    type: {type: String, require: true},
    name: {type: String, require: true},
    amount: {type: Number, require: true},
    date: {type: Date, require: true}
});

const Expense = mongoose.model('expense', expenseSchema);
Expense.createIndexes();

const express = require('express');
const app = express();
const cors = require("cors");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());

app.post('/addExpense', async (req,resp) => {
    try{
        const newExpense = new Expense(req.body);
        let res = await newExpense.save();
        result = res.toObject();
        if (result) {
            delete result.password;
            resp.send(req.body);
            console.log(result);
        } else {
            console.log("User already register");
        }
    }catch(e){
        console.log("Something went wrong");
    }
});

app.delete('/deleteExpense/:id', async (req,resp) => {
    try {
        const expenseId = req.params.id;
        console.log(expenseId);
        const deletedExpense = await Expense.findOneAndDelete({ id: expenseId });
    
        if (!deletedExpense) {
          return resp.status(404).json({
            success: false,
            message: 'Expense not found',
          });
        }
    
        return resp.status(200).json({
          success: true,
          message: 'Expense deleted successfully',
          data: deletedExpense,
        });
      } catch (error) {
        console.error(error);
        return resp.status(500).json({
          success: false,
          message: 'Internal Server Error',
        });
      }
});

app.get("/getExpenses", async (req, resp) => {
    try{
        var expenses = await Expense.find() ;
        
        var result = []
        for (i=0;i<expenses.length;i++){
            const getdate = new Date(expenses[i].date);
            const year = getdate.getFullYear();
            const month = String(getdate.getMonth() + 1).padStart(2, '0');
            const day = String(getdate.getDate()).padStart(2, '0');
            const newDate = `${year}-${month}-${day}`;
            console.log(newDate);
            result.push(
                {
                    "id":expenses[i].id,
                    "type":expenses[i].type,
                    "name":expenses[i].name,
                    "amount":expenses[i].amount,
                    "date":newDate,
                })
        };
        result.sort((a,b) => new Date(b.date) - new Date(a.date));
        console.log(result);
        resp.status(200).json({
            success: true,
            message: 'Expenses fetch successful',
            data: result,
          });
        // return "true";
    }catch(e){
        console.log(e);
        console.log("Something went wrong");
    }
});


app.listen(5000);