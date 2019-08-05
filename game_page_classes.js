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
        var numer = this.numerator;
        var denom = this.denominator;
        
        var obj = 
        {
            "numerator" : numer,
            "denominator" : denom
        };
        
        return obj;
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
        var siz = this.size;
        var res = [];
        for(var ct=0; ct< this.size; ct++)
        {
            res.push(this.entries[ct].exportJsonObject());
        }
        
        var obj = 
        {
            "size" : siz,
            "entries" : res
        };
        
        return obj;
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
    
    exportJsonObject()
    {
        var ay = [];
        
        for(var ct=0; ct<this.height; ct++)
        {
            ay.push(this.matrix[ct].exportJsonObject());
        }
        
        var obj =
        {
            "height" : this.height,
            "width": this.width,
            "matrix" : ay
        };
        
        return obj;
    }
    
    importJsonObject(ob)
    {
        //reset everything
        this.height = ob.height;
        this.width = ob.width;
        this.matrix = [];
        
        for(var ct=0; ct<this.height; ct++)
        {
            //create row and push it into array
            var row = new MatrixRow(this.width);
            row.importJsonObject(ob.matrix[ct]);
            this.matrix.push(row);
        }
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
