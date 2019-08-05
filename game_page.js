//the size of matrix, currently set to 3
var matrixSize;

//variable to store the left and right matrix
var leftMatrix;
var rightMatrix;

//the object containing the matrix pair and the mother object of the game functions
var matrixPair;
var gamePanel;

function setup()
{
    /*
    var don = document.querySelector(".MatrixRow");
    don.addEventListener("click", clickedTest);
    */
    
    //set the size of the game matrix
    matrixSize = 5;
    
    //gets the style of the whole html element
    var htmlStyle = document.querySelector("html").style;
    //get the computer style to access the getter of css values
    var computedStyle = getComputedStyle(document.body);
    //the box height of the display of matrix(currently set to 30vh)
    var boxHeight = computedStyle.getPropertyValue("--MatrixBoxHeight");
    var bh = parseFloat(boxHeight);
    //calculate individual row height base on how many rows
    var entrySize = bh / matrixSize;
    //and then set the CSS variable
    htmlStyle.setProperty("--MatrixElementSize", entrySize + "vh");
    htmlStyle.setProperty("--MatrixElementFontSize", (entrySize/2) + "vh");
    htmlStyle.setProperty("--MatrixElementFontSizeSmall", (entrySize/3) + "vh");
    
    //create matrices
    var left = new Matrix(matrixSize, matrixSize);
    left.generateRandom();
    var right = new Matrix(matrixSize, matrixSize);
    right.generateIdentity();
    leftMatrix = left;
    rightMatrix = right;
    
    //create the matrix pair and game panel
    matrixPair = new MatrixPair(left, right);
    gamePanel = new GamePanel(matrixPair);
    
    renderMatrices();
}

//function for re-rendering matrices
function renderMatrices()
{
    /*
    //render matrices
    var leftm = leftMatrix.render();
    var rightm = rightMatrix.render();
    
    //remove all child of div and add newly rendered matrices
    document.getElementById("MatrixLeftDiv").innerHTML = "";
    document.getElementById("MatrixRightDiv").innerHTML = "";
    document.getElementById("MatrixLeftDiv").appendChild(leftm);
    document.getElementById("MatrixRightDiv").appendChild(rightm);
    */
    gamePanel.render();
}

function clickedTest()
{
    alert("clicked!");
}

//call setup function when loaded
document.addEventListener("DOMContentLoaded", setup);