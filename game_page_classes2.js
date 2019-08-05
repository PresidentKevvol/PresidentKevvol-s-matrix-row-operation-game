//function finding the greatest common divisor recursivly
function gcd_rec(a, b)
{
    if (b) {
        return gcd_rec(b, a % b);
    } else {
        return Math.abs(a);
    }
}

//function to generate random integer
function getRandomInt(min, max)
{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//a rational fraction, used for calculation
class RationalNumber
{
    constructor(num, denom)
    {
        //numerator of fraction, can be negative
        this.numerator = num;
        //denominator of fraction, cannot be negative(negative values will be adjusted)
        this.denominator = denom;
        //adjust the numbers
        this.adjust();
    }

    //method for rendering a fraction as an html snippet
    render()
    {
        //the result to return
        var res;
        
        //if denominator is 1
        if(this.denominator == 1)
        {
            res = this.numerator;
        }
        else
        {
            res = "<sup>" + this.numerator + "</sup>&frasl;<sub>" + this.denominator + "</sub>";
        }
        
        //use small font if number is too long
        if(Math.abs(this.denominator) >= 1000 || Math.abs(this.numerator) >= 1000)
        {
            res = "<div class='MatrixEntrySmallFont'>" + res + "</div>";
        }
        
        return res;
    }
    
    //render as a matrix entry
    renderEntry()
    {
        var templ = document.getElementById("MatrixTemplateEntry").content.cloneNode(true);
        var entry = templ.querySelector(".MatrixEntry");
        entry.innerHTML = this.render();
        //entry.classList.add("MatrixEntrySmallFont");
        return templ;
    }
    
    //adjusting method after any operation
    adjust()
    {
        //adjust for negative denominator
        if(this.denominator < 0)
        {
            this.denominator = -this.denominator;
            this.numerator = -this.numerator;
        }
        
        //reduce the fraction
        var num = Math.abs(this.numerator);
        //get the gcd(hcf)
        var gcd = gcd_rec(num, this.denominator);
        //reduce fraction
        this.numerator /= gcd;
        this.denominator /= gcd;
    }
    
    //add with another RationalNumber
    add(b)
    {
        //numerators and denominators of both fractions
        var an = this.numerator;
        var ad = this.denominator;
        var bn = b.numerator;
        var bd = b.denominator;
        
        //add the fraction
        this.numerator = an * bd + bn * ad;
        this.denominator = ad * bd;
        
        //adjust
        this.adjust();
    }
    
    //multiply with another RationalNumber
    multiply(b)
    {
        this.numerator *= b.numerator;
        this.denominator *= b.denominator;
        
        //adjust
        this.adjust();
    }
    
    //inverse of this fraction
    inverse()
    {
        return new RationalNumber(this.denominator, this.numerator);
    }
    
    //divide by another fraction
    divide(b)
    {
        this.multiply(b.inverse());
    }
    
    //create a deep clone of this RationalNumber object
    deepCopy()
    {
        return new RationalNumber(this.numerator, this.denominator);
    }
    
    //export this ec object as a json object(not a string)
    exportJsonObject()
    {
        return 
        {
            "numerator" : this.numerator,
            "denominator" : this.denominator
        };
    }
    
    //import from a json object
    importJsonObject(obj)
    {
        this.numerator = obj.numerator;
        this.denominator = obj.denominator;
    }
}

class MatrixRow
{
    constructor(d)
    {
        //size of row
        this.size = d;
        
        //entries
        this.entries = [];
        for(var ct=0; ct<d; ct++)
        {
            this.entries.push(new RationalNumber(0, 1));
        }
    }
    
    //generate random values for the row
    generateRandom()
    {
        for(var ct=0; ct< this.size; ct++)
        {
            var num = getRandomInt(-10, 10);
            this.entries[ct] = new RationalNumber(num, 1);
        }
    }
    
    getElement(i)
    {
        return this.entries[i];
    }
    
    setElement(i, r)
    {
        this.entries[i] = r;
    }
    
    //render this row, i being the index of the row, and s being a boolean that should be 'true' if it's a selected row, and dropAllow being if drop is allow(avoiding dropping -1 transform to selected row itself causing all 0)
    render(i, s, dropAllow)
    {
        var templ = document.getElementById("MatrixTemplateRow").content.cloneNode(true);
        var row = templ.querySelector(".MatrixRow");
        
        //loop to render each element
        for(var ct=0; ct<this.size; ct++)
        {
            row.appendChild(this.entries[ct].renderEntry());
        }
        
        //add event handler to row element
        row.addEventListener("click", listenerGeneratorClick(i));
        row.addEventListener("drop", listenerGeneratorDragDropped(i));
        if(dropAllow)
        {
            row.addEventListener("dragover", allowDrop);
        }
        
        //render if it's selected
        if(s)
        {
            row.classList.add("selectedRow");
        }
        
        return templ;
    }
    
    //simplified rendering, used for transform panel
    renderForTransformPanel()
    {
        var templ = document.getElementById("MatrixTemplateRow").content.cloneNode(true);
        var row = templ.querySelector(".MatrixRow");
        
        //loop to render each element
        for(var ct=0; ct<this.size; ct++)
        {
            row.appendChild(this.entries[ct].renderEntry());
        }
        
        return templ;
    }
    
    //add the value of a new MatrixRow to this row
    addRow(r)
    {
        for(var ct=0; ct< this.size; ct++)
        {
            this.entries[ct].add(r.entries[ct]);
        }
    }
    
    //multiply everything of this row by r(RationalNumber)
    multiplyBy(r)
    {
        for(var ct=0; ct<this.size; ct++)
        {
            this.entries[ct].multiply(r);
        }
    }
    
    //deep copy the object, used for clculating for transforming
    deepCopy()
    {
        var res = new MatrixRow(this.size);
        
        //create new RationalNumber object for each element
        for(var ct=0; ct<this.size; ct++)
        {
            res.setElement(ct, this.entries[ct].deepCopy());
        }
        
        return res;
    }
    
    //export as a JSON object
    exportJsonObject()
    {
        var res = [];
        for(var ct=0; ct< this.size; ct++)
        {
            res.push(this.entries[ct].exportJsonObject());
        }
        
        return
        {
            "size" : this.size,
            "entries" : res
        };
    }
    
    //import from a json object(not string)
    importJsonObject(obj)
    {
        this.size = obj.size;
        this.entries = [];
        
        //create each entry
        for(var ct=0; ct<this.size; ct++)
        {
            this.entries[ct] = new RationalNumber(1, 1);
            this.entries[ct].importJsonObject(obj.entries[ct]);
        }
    }
}

class Matrix
{
    //constructor with the dimension specified
    constructor(w, h)
    {
        //width of matrix
        this.width = w;
        //height of matrix
        this.height = h;
        
        //the row that is selected
        this.rowSelected = -1;
        
        //create the array of matrix rows
        this.matrix = [];
        for(var ct=0; ct<h; ct++)
        {
            this.matrix.push(new MatrixRow(w));
        }
    }
    
    //generate random numbers
    generateRandom()
    {
        for(var ct=0; ct< this.height; ct++)
        {
            this.matrix[ct].generateRandom();
        }
    }
    
    //generate the identity matrix
    generateIdentity()
    {
        for(var ct=0; ct<this.height; ct++)
        {
            this.matrix[ct].setElement(ct, new RationalNumber(1, 1));
        }
    }
    
    //render as an html table
    render()
    {
        var templ = document.getElementById("MatrixTemplate").content.cloneNode(true);
        var matr = templ.querySelector(".Matrix");
        
        for(var ct=0; ct<this.height; ct++)
        {
            //debug
            console.log("Matrix rendering, ct: " + ct + " rowSelected: " + this.rowSelected);
            
            var row;
            
            if(ct === this.rowSelected)
            {
                //render with added stylesheet class if it's selected, and block dropping to same row
                row = this.matrix[ct].render(ct, true, false);
            }
            else
            {
                //render a row from MatrixRow object
                row = this.matrix[ct].render(ct, false, true);
            }
            
            matr.appendChild(row);
        }
        
        return templ;
    }
    
    //set the selected row
    setSelected(i)
    {
        this.rowSelected = i;
    }
    
    //add a row to one of the matrix' rows. i is index of row, r is the row to be added to that row
    addToRow(i, r)
    {
        this.matrix[i].addRow(r);
    }
    
    //setter for a row
    setRow(i, r)
    {
        this.matrix[i] = r;
    }
    
    //getter method for a row
    getRow(i)
    {
        return this.matrix[i];
    }
    
    //method for swapping two rows
    swapRows(i1, i2)
    {
        var placeholder = this.matrix[i1];
        this.matrix[i1] = this.matrix[i2];
        this.matrix[i2] = placeholder;
    }
}

//a left-right pair of MatrixRow s, used for game function
class MatrixRowPair
{
    //constructor with two MatrixRow objects
    constructor(r1, r2)
    {
        this.row1 = r1;
        this.row2 = r2;
    }
    
    //multiply both rows by a factor
    multiplyBy(r)
    {
        this.row1.multiplyBy(r);
        this.row2.multiplyBy(r);
    }
    
    //deep copy the MatrixRowPair object, used for transformations
    deepCopy()
    {
        return new MatrixRowPair(this.row1.deepCopy(), this.row2.deepCopy());
    }
}

//class for a pair of matrix containing two matrices
class MatrixPair
{
    //constructor with height, width of left matrix, and width of right matrix
    constructor(m1, m2)
    {
        this.left = m1;
        this.right = m2;
        
        //the row that is selected
        this.rowSelected = -1;
    }
    
    //set the selected row
    setSelected(i)
    {
        this.rowSelected = i;
        this.left.setSelected(i);
        this.right.setSelected(i);
    }
    
    //get the MatrixRowPair object for the selected row
    getSelectedRowPair()
    {
        //get the selected number
        var i = this.rowSelected;
        
        console.log("getSelectedRowPair(): rowselected: " + i);
        
        //checking
        if(i < 0)
        {
            return;
        }
        
        return new MatrixRowPair(this.left.matrix[i], this.right.matrix[i]);
    }
    
    render()
    {
        //render matrices
        var leftm = this.left.render();
        var rightm = this.right.render();
    
        //remove all child of div and add newly rendered matrices
        document.getElementById("MatrixLeftDiv").innerHTML = "";
        document.getElementById("MatrixRightDiv").innerHTML = "";
        document.getElementById("MatrixLeftDiv").appendChild(leftm);
        document.getElementById("MatrixRightDiv").appendChild(rightm);
    }
    
    //when a drag and drop event is dropped at one of the rows
    dragDropped(ev, i)
    {
        //the key for the global dictionary
        var key = ev.dataTransfer.getData("text");
        console.log(key);
        //called method to add row
        this.addRowPairToRow(i, dragDropDictGlobal[key]);
        //delete from dictionary
        delete dragDropDictGlobal[key];
    }
    
    //called after a drag event is dropped, i is the index of row, rp is the row pair object
    addRowPairToRow(i, rp)
    {
        console.log("addRowPairToRow(): called, rp: " + typeof rp + " contents: " + rp);
        this.left.addToRow(i, rp.row1);
        this.right.addToRow(i, rp.row2);
    }
    
    //set one row of the matrix to a specific MatrixRowPair, i is the index, and rp is the rowpair
    setRowPair(i, rp)
    {
        this.left.setRow(i, rp.row1);
        this.right.setRow(i, rp.row2);
    }
    
    //the repaste method, when repaste button is clicked
    repaste(rp)
    {
        this.setRowPair(this.rowSelected, rp);
    }
    
    //method for swapping rows on both matrices
    swapRows(i1, i2)
    {
        this.left.swapRows(i1, i2);
        this.right.swapRows(i1, i2);
    }
}

class TransformPanel
{
    constructor()
    {
        //the selected row pair
        this.selectedRowPair = null;
        //the factor of transforming a row (*3/5, *-4, etc.), a RationalNumber object
        this.transformFactor = null;
        //the transformed of the selected row pair
        this.selectedRowPairTransformed = null;
    }
    
    //render the Transform panel, b is true if it should be active
    render(b)
    {
        if(b)
        {
            document.getElementById("TransformSpaceInner").style.visibility = "visible";
            
            var rowPair = this.selectedRowPairTransformed;
            
            //for testing
            //var rowPair = this.selectedRowPair;
            
            var leftRow = rowPair.row1.renderForTransformPanel();
            var rightRow = rowPair.row2.renderForTransformPanel();
            
            document.getElementById("selectedTransformLeft").innerHTML = "";
            document.getElementById("selectedTransformLeft").appendChild(leftRow);
            document.getElementById("selectedTransformRight").innerHTML = "";
            document.getElementById("selectedTransformRight").appendChild(rightRow);
        }
        else//if it is not active
        {
            document.getElementById("TransformSpaceInner").style.visibility = "hidden";
        }
    }
    
    //called when a row is selected, with rp being the selected row pair
    rowIsSelected(rp)
    {
        console.log("rowISSelected() called");
        console.log(typeof rp);
        
        //copy the the MatrixRowPair object into field
        //this.selectedRowPair = Object.assign( Object.create( Object.getPrototypeOf(rp)), rp);
        //this.selectedRowPair = JSON.parse(JSON.stringify(rp));
        this.selectedRowPair = rp.deepCopy();
        
        //reset the text fields
        this.resetTextFields();
        //reset the transform factor
        this.transformFactor = new RationalNumber(1,1);
        //set tht transform factor
        this.setScale();
    }
    
    //reset the transform panel
    reset()
    {
        this.selectedRowPair = null;
        this.transformFactor = null;
        this.selectedRowPairTransformed = null;
    }
    
    //resets the text fields
    resetTextFields()
    {
        document.getElementById("TransformNumerator").value = "";
        document.getElementById("TransformDenominator").value = "";
    }
    
    //called when text field is changed, updates the numbers of preview row
    textFieldChanged()
    {
        //get the text from textfields
        var numerT = document.getElementById("TransformNumerator").value;
        var denomT = document.getElementById("TransformDenominator").value;
        //parse numbers
        var numer = parseInt(numerT, 10);
        var denom = parseInt(denomT, 10);
        
        //skimming, prevent 0 denominator, or non-numerical characters
        if(isNaN(numer))
        {
            numer = 1;
        }
        if(isNaN(denom) || denom === 0)
        {
            denom = 1;
        }
        
        console.log("textFieldChanged(): numer: " + numer + " denom: " + denom);
        
        this.transformFactor = new RationalNumber(numer, denom);
        this.setScale();
    }
    
    //change the transform factor
    setScale()
    {
        //clone the object to 'transformed' object
        //this.selectedRowPairTransformed = Object.assign( Object.create( Object.getPrototypeOf(this.selectedRowPair)), this.selectedRowPair);
        //this.selectedRowPairTransformed = JSON.parse(JSON.stringify(this.selectedRowPair));
        this.selectedRowPairTransformed = this.selectedRowPair.deepCopy();
        
        //transform
        this.selectedRowPairTransformed.multiplyBy(this.transformFactor);
    }
    
    //when the dragging of the transformed row begin
    dragBegin(ev)
    {
        //put the row pair to the transformed object
        ev.dataTransfer.setData("text", "rowAdditionDrag");
        //add to global dictionary
        dragDropDictGlobal["rowAdditionDrag"] = this.selectedRowPairTransformed;
        
        //debug
        console.log(dragDropDictGlobal["rowAdditionDrag"]);
        console.log(this.selectedRowPairTransformed);
    }
}

//object representing the game panel
class GamePanel
{
    //constructor with a MatrixPair
    constructor(mp)
    {
        //the MatrixPair object
        this.pair = mp;
        //number of rows
        this.numRows = mp.left.height;
        //the transformation panel
        this.panel = new TransformPanel();
        //show the transform panel if one row is selected
        this.transformPanelActive = false;
        //the selected row pair
        this.selectedRowPair = null;
        //the factor of transforming a row (*3/5, *-4, etc.), a RationalNumber object
        this.transformFactor = null;
        //the transformed of the selected row pair
        this.selectedRowPairTransformed = null;
    }
    
    //render the entire game panel
    render()
    {
        this.pair.render();
        
        //if transform panel is active(row clicked)
        this.panel.render(this.transformPanelActive);
        
        //render the knobs
        this.renderKnobs();
    }
    
    //render the knobs
    renderKnobs()
    {
        //get the element containing the knobs and clear it
        var matrixKnobTable = document.getElementById("MatrixKnobTable");
        matrixKnobTable.innerHTML = "";
        
        //render each knob
        for(var ct=0; ct<this.numRows; ct++)
        {
            var templ = document.getElementById("MatrixTemplateKnob").content.cloneNode(true);
            var knob = templ.querySelector(".knob");
            
            knob.addEventListener("dragstart", listenerGeneratorKnobDragBegin(ct));
            knob.addEventListener("dragover", knobDragOverListener);
            knob.addEventListener("dragleave", knobDragExitListener);
            knob.addEventListener("drop", listenerGeneratorKnobDragDropped(ct));
            
            matrixKnobTable.appendChild(templ);
        }
    }
    
    //called when a row is selected
    rowSelected(i)
    {
        this.pair.setSelected(i);
        this.transformPanelActive = true;
        var rowPair = this.pair.getSelectedRowPair();
        this.panel.rowIsSelected(rowPair);
    }
    
    //called when the text field of the transform panel changes
    panelTextFieldChanged()
    {
        this.panel.textFieldChanged();
        this.panel.render(true);
    }
    
    //when the dragging of transformed panel begins
    dragBegin(ev)
    {
        this.panel.dragBegin(ev);
    }
    
    //called when transformed row dragged to a row
    dragDropped(ev, i)
    {
        this.pair.dragDropped(ev, i);
        this.resetAfterMatrixChange();
        this.render();
    }
    
    //resetting the selected row attributes
    resetAfterMatrixChange()
    {
        //reset the transform panel
        this.panel.reset();
        this.transformPanelActive = false;
        //reset the selected row index
        this.pair.setSelected(-1);
    }
    
    //replace a row with it's scaled counterpart when the repaste button is pressed
    repaste()
    {
        this.pair.repaste(this.panel.selectedRowPairTransformed);
        this.resetAfterMatrixChange();
        this.render();
    }
    
    //method for switching two rows using knobs, i1 and i2 are their index
    swapRows(i1, i2)
    {
        this.pair.swapRows(i1, i2);
        //re-render everything
        this.resetAfterMatrixChange();
        this.render();
    }
}

//generate a listener function(like an interface) for a specific index
function listenerGeneratorClick(i)
{
    console.log(i + " generated");
    
    return function(e)
    {
        console.log(i + " clicked");
        //alert("Row " + i + " clicked!");
        
        //test code
        /*
        //creates a matrix row and add to a matrix
        var ro = new MatrixRow(3);
        ro.setElement(0, new RationalNumber(1, 1));
        leftMatrix.addToRow(0, ro);
        */
        gamePanel.rowSelected(i);
        
        renderMatrices();
    };
}

//'generates' the drag begin function
function listenerGeneratorDragStart()
{
    //the function for drag begin
    return function(ev)
    {
        
    }
}

//event handler called when the panel text field is changed
function onTransformPanelTextChange()
{
    gamePanel.panelTextFieldChanged();
}

//the drag begin listener for the transform panel
function onTransformPanelDragBegin(ev)
{
    console.log("drag begun");
    gamePanel.dragBegin(ev);
}

//function allowing the drag and drop of rows
function allowDrop(ev)
{
    ev.preventDefault();
}

//generates the dropping listener
function listenerGeneratorDragDropped(i)
{
    return function(ev)
    {
        //check to see if drop valid
        var key = ev.dataTransfer.getData("text");
        if(key === "rowAdditionDrag")
        {
            gamePanel.dragDropped(ev, i);
        }
    }
}

//called when the repaste button on the transform panel clicked
function onRepasteButtonClicked()
{
    gamePanel.repaste();
}

//listener function generator of knob drag beginning
function listenerGeneratorKnobDragBegin(i)
{
    return function(ev)
    {
        //set the data
        ev.dataTransfer.setData("text", "rowSwapDrag");
        //put the index to the drag and drop dictionary
        dragDropDictGlobal["rowSwapDrag"] = i;
        //change sprite
        ev.target.src = "knob_drag.svg";
    };
}

//called when knob is dragged over
function knobDragOverListener(ev)
{
    ev.preventDefault();
    ev.target.src = "knob_drag.svg";
}

//when a draging of knob exits a knob's area
function knobDragExitListener(ev)
{
    //ev.preventDefault();
    ev.target.src = "knob_base.svg";
}

//listener function generator for when knob drag dropped
function listenerGeneratorKnobDragDropped(i)
{
    return function(ev)
    {
        //check to see if drop valid
        var key = ev.dataTransfer.getData("text");
        if(key === "rowSwapDrag")
        {
            //get the index the event is from
            var fromIndex = dragDropDictGlobal["rowSwapDrag"];
            //perform action
            gamePanel.swapRows(fromIndex, i);
            //delete variable
            delete dragDropDictGlobal["rowSwapDrag"];
        }
    };
}

var dragDropDictGlobal = {};