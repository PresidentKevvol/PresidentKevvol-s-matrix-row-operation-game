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