var x = 2;
var y = '2';
// console.log(x == y); //checks the value - loosly check
// console.log(x === y); //checks the datatype and value - tightly check

var x = 3;
var y = '3';
const result = x + y; // Returns "33"
// console.log(result);
// console.log(typeof result); //when a number added to string the result will became string

// hoistedVariable = 3;
// console.log(hoistedVariable); // outputs 3 even when the variable is declared after it is initialized
// var hoistedVariable;

// hoistedVariable2 = 3;//ERROR ON THIS LINE -Cannot access 'hoistedVariable2' before initialization
// console.log(hoistedVariable);
// let hoistedVariable2;

// hoistedFunction(); // Outputs " Hello world! " even when the function is declared after calling

// function hoistedFunction() {
//   console.log(' Hello world! ');
// }

var x = 0;
var y = 23;

if (x) {
  //   console.log(x);
} // The code inside this block will not run since the value of x is 0(Falsy)

if (y) {
  //   console.log(y);
}

var x = 0;
var y = 'Hello';
var z = undefined;

// console.log(y && z);
// console.log(y || z);
// console.log(x || y); //result will be y-'HELLO' because x-0 is falsy value.

let firstName = 'Sahal';
let lastName = 'Fouz';
const fullname = firstName + lastName; //give the result 'SahalFouz' and the datatype = string, because + operator string coercion
console.log(fullname);
console.log(typeof fullname); //dataType-string

const filterObj = (obj, ...allowedFields) => {
  console.log("obj=",obj);
  console.log("allowedFields=",allowedFields);
};

filterObj('hyy', 'name', 'email');