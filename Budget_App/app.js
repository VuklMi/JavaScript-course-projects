// budget controller
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    // all Expense objects will inherit this method
    Expense.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;    
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(currentEl) {
            sum += currentEl.value;
        });
        data.totals[type] = sum;
    };
    
    // our data structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1 // does not exist at this point
    };
    
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            // create new ID -> ID = lastID + 1
            if(data.allItems[type].length) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            
            // create new element base on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else { // type === 'inc'
                newItem = new Income(ID, desc, val);
            }
            
            // push the new item into our data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            // create array with all of the ids
            ids = data.allItems[type].map(function(currentEl, currentIndex, array) {
               return currentEl.id; 
            });
            
            index = ids.indexOf(id);
            
            if(index > -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            // calculate total income and total expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of the income spent
            if(data.totals.inc) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        
        
        calculatePercentages: function () {
            // expense / totalIncome * 100
            data.allItems.exp.forEach(function(currentEl) {
                currentEl.calculatePercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(currentEl) {
                return currentEl.getPercentage(); // calls the getPercentage method for each object of class Expense
            });
            return allPercentages; // array of all percentages
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        }
    };
})();






// UI controller
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            /*
            + or - in front of the number
            exactlu 2 decimal points
            comma separating the thousands
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            var numSplit = num.split('.');
            var int = numSplit[0]; // integer part
            var dec = numSplit[1]; // decimal part
            
            if(int.length > 3) {
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length, 3);
            }
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +  dec;
    };
    
    
    // list does not have forEach method => create our own forEach function
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    return {
        getDOMstrings: function () {
            return DOMstrings;
        },
        
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType). value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(item, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div</div></div>'
            }
            else { // type === 'exp'
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div></div>'
            }
            // replace placeholder text with the received data
            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            // trick to convert list returned by querySelectorAll method into array (enables to loop through the elements)
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(currentElement, index, array) {
                currentElement.value = ""; // empty the string in the element
            });
            
            // set the focus back to the first element of the array
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); // list
            
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },
        
        displayMonth: function() {
            var now, year, month, months;
            now = new Date(); // returns today's date
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + 
                                                   DOMstrings.inputDescription + ',' + 
                                                   DOMstrings.inputValue);
            nodeListForEach(fields, function(currentEl) {
                currentEl.classList.toggle('red-focus');
            });   
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };
})();






// global app controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
         // click 
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);


        // keypress (return)
        document.addEventListener('keypress', function (event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        var budget;
        // calculate the budget
        budgetCtrl.calculateBudget();
        
        // return the budget
        budget = budgetCtrl.getBudget();
        
        // display the budget (UI)
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        // calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // read the %s from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the input data
        input = UICtrl.getInput();
        
        if(input.description && !isNaN(input.value) && input.value) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate the budget + display the budget (UI)
            updateBudget();
            
            // 6. calculate the percentages and update them in UI
            updatePercentages();
            
        }
    };
    
    var ctrlDeleteItem = function(event) { // event delegation
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // DOM traversal (from the button that's clicked into the most top element (div) that contains the unique ID)
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0]; // inc or exp
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. update and show the new budget
            updateBudget();
            
            // 4. calculate the percentages and update them in UI
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();