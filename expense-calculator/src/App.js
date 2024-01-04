import './App.css';
import React, { useState, useEffect } from "react";
import  Button  from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Container, Table } from 'react-bootstrap';
import { Chart } from "react-google-charts";

function ExpensesTable(props){
  const handleDelete = (id) => {
    props.handleDeleteItem(id);
  };

  return (
    <Container fluid style={{maxHeight: '390px',  overflowY: 'auto' }}>
      <Table striped bordered hover responsive variant='light'>
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Type</th>
            <th>Amount(Rs.)</th>
            <th>Date(yyyy-mm-dd)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {props.expenses.map((expense) =>(
          <tr key={expense.id}>
            <td>{expense.name}</td>
            <td>{expense.type}</td>
            <td>{expense.amount}</td>
            <td>{expense.date}</td>
            <td><Button variant="danger" onClick={() => handleDelete(expense.id)}>Delete</Button></td>
          </tr>
        ))}
        </tbody>
      </Table>
    </Container>
  );
}

function SummaryTable(props){
  return (
    <table className='table'>
      <thead>
        <tr>
          <th>Income(Rs.)</th>
          <th>Expense(Rs.)</th>
          <th>Total(Rs.)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.totalIncome}</td>
          <td>{props.totalExpense}</td>
          <td>{parseInt(props.totalIncome) - parseInt(props.totalExpense)}</td>
        </tr>
      </tbody>
    </table>
  );
};

function InputValue(props){
  const handleNameChange = (event) => {
    props.setName(event.target.value)
  };
  const handleTypeChange = (event) => {
    props.setType(event.target.value)
  };
  const handleAmountChange = (event) => {
    props.setAmount(event.target.value)
  };
  const handleDateChange = (event) => {
    props.setDate(event.target.value)
  };
  const handleTodayDate = () => {
    const newDate = new Date();
    const day = newDate.getDate().toString().padStart(2, '0');
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const year = newDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    props.setDate(formattedDate);
  };
  
  const handleAddExpense = async () => {
    const newName = props.name;
    const newType = props.type;
    const newAmount = props.amount;
    const newDate = props.date;
    var newId = 0;
    if(props.expenses.length !== 0){
      newId = Math.max(...props.expenses.map(item => parseInt(item.id))) + 1;
    }
    const newExpense = { id: newId, name: props.name, type: props.type,
      amount: props.amount, date: newDate };
    if(props.type === "Income"){
      props.setTotalIncome(parseInt(props.totalIncome) + parseInt(props.amount));
    }
    else{
      props.setTotalExpense(parseInt(props.totalExpense) + parseInt(props.amount));
    }
    const updatedExpenses = [...props.expenses, newExpense];
    updatedExpenses.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    const renumberedExpenses = updatedExpenses.map((item,index) =>({
      ...item,
      id: index + 1,
    }));
    props.setExpenses(renumberedExpenses);
    console.log(props.expenses)

    let result = await fetch(
      'http://localhost:5000/addExpense',{
        method:"post",
        body: JSON.stringify({ "id":newId, "type":newType, "name":newName, "amount":newAmount, "date":newDate }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log(result.json())
  }

  return (
    <Container fluid style={{ backgroundColor: '#f0f0f0'}}>
      <Form>
        <Row className="d-flex justify-content-center align-items-center">
          <Col>  
            <Form.Label>Type</Form.Label>
          </Col>
          <Col md={2}>
            <Form.Select size="sm" onChange={handleTypeChange}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>Name</Form.Label>
          </Col>
          <Col md={2}>
            <Form.Control 
              size='sm'
              name="Name"
              value = {props.name}
              onChange={handleNameChange}
            />
          </Col>
          <Col>
            <Form.Label>Amount (in Rs)</Form.Label>
          </Col>
          <Col md={2}>
            <Form.Control 
              size='sm'
              name="Amount" 
              type="number" 
              value = {props.amount}
              onChange={handleAmountChange}
            />
          </Col>
          <Col>
            <Form.Label>Date</Form.Label>
          </Col>
          <Col>
            <Form.Control 
              size='sm'
              name="Amount" 
              type="date" 
              value = {props.date}
              onChange={handleDateChange}
            />
          </Col>
          <Col>
            <Button variant="info" size='sm' name="todayDate" onClick={handleTodayDate}>today</Button>
          </Col>
          <Col >
            <Button variant="primary" size='sm' name="addExpense" onClick={handleAddExpense}>Add Expense</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  )
};

const PieChart = (props) => {
  const [pieType, setPieType] = useState("Income");
  const handlePieTypeChange = (event) => {
    setPieType(event.target.value)
  };
  const uniqueCategories = [...new Set(props.expenses.map(item => item.name))];
  const categoryTotalAmounts = uniqueCategories.map(category =>
    props.expenses
      .filter(item => item.name === category)
      .filter(item => item.type === pieType)
      .reduce((total, item) => total + parseInt(item.amount), 0)
  );
  
  const options = {
    title: pieType,
  };
  const chartData = [["Name", "Amount"]];
  for (let i = 0; i < uniqueCategories.length; i++) {
    chartData.push([uniqueCategories[i], categoryTotalAmounts[i]]);
  }
  

  return (
    <Container fluid style={{ backgroundColor: '#f0f0f0'}}>
      <Row>
        <Col>
        <Form.Select size="sm" onChange={handlePieTypeChange}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </Form.Select>
        </Col>
      </Row>
      <Row>
        <Col>
          <Chart
            chartType="PieChart"
            data={chartData}
            options={options}
            width={"100%"}
            height={"400px"}
          />
        </Col>
      </Row>
    </Container>
    )
}


function App() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [type, setType] = useState("Income");
  const [totalIncome,setTotalIncome] = useState(0);
  const [totalExpense,setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchData= async () =>{
      try{
        console.log("Getting Result");
        const response = await fetch('http://localhost:5000/getExpenses',{
          method:"get",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("Got Result");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setExpenses(result.data);
        var Expenses = 0;
        var Income = 0;
        console.log(result.data);
        for(var i=0;i<result.data.length;i++){
          if(result.data[i].type === "Income"){
            Income += parseInt(result.data[i].amount);
          }else{
            Expenses += parseInt(result.data[i].amount);
          }
        }
        setTotalExpense(Expenses);
        setTotalIncome(Income);
        console.log("Parsed Result");
      } catch (error) {
        console.log("Error while parsing result");
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteItem = async (id) => {
    const deleteExpense = expenses.filter(item => item.id === id)[0];
    console.log(deleteExpense)
    if(deleteExpense.type === "Income"){
      setTotalIncome(parseInt(totalIncome) - parseInt(deleteExpense.amount));
    }
    else{
      setTotalExpense(parseInt(totalExpense) - parseInt(deleteExpense.amount));
    }
    const newExpenses = expenses.filter(item => item.id !== id);
    setExpenses(newExpenses);

    const response = await fetch(`http://localhost:5000/deleteExpense/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  };

  return (
    <div className="App">
      <h2> Expense Tracker</h2>
      <InputValue 
        name={name} 
        setName={setName} 
        amount={amount} 
        setAmount={setAmount}
        expenses={expenses} 
        setExpenses={setExpenses}
        date={date}
        setDate={setDate}
        type={type}
        setType={setType}
        totalExpense={totalExpense}
        setTotalExpense={setTotalExpense}
        totalIncome={totalIncome}
        setTotalIncome={setTotalIncome}
      />
      <SummaryTable
        totalExpense={totalExpense}
        totalIncome={totalIncome}
      />
      <ExpensesTable 
        expenses={expenses}
        setExpenses={setExpenses}
        handleDeleteItem={handleDeleteItem}
        />
      <h2>Pie Chart</h2>
      <PieChart
        expenses={expenses}
      />

      
    </div>
  );
}

export default App;
