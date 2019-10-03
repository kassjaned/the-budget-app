////////////
/* BUDGET CONTROLLER MODULE */
////////////
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
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
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

/* This is one way to store our input data, but not a good practice to have all these variables floating around so instead let's make objects as below.

        var allExpenses = [];
        var allIncomes = [];
        var totalExpenses = 0;
        var totalIncomes = 0;

*/ // Instead let's do it like this: 

        var data = {
            allItems: {  // all expenses, all incomes
                exp: [],
                inc: []
            },
            totals: {   // total expenses, total incomes
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
        };

        return {  // make public methods
            addItem: function(type, desc, val) {

                var newItem, ID;
                // ID is all items added or deleted to budget
                // ID: We want ID to = last ID of array + 1

                // create new ID
                // First retrieve item: data.allItems[type]
                // Then we need to get the link of the item so we need to type all that again to get length -1: [data.allItems[type].length - 1]
                // then last ID - 1

                if (data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }

                // Create new item based on 'inc' or 'exp' type
                if (type === 'exp') {
                    newItem = new Expense(ID, desc, val);
                } else if (type === 'inc') {
                    newItem = new Income(ID, desc, val);
                }

                // Push new item to data structure
                data.allItems[type].push(newItem);

                // Return new element
                return newItem;
            },

            deleteItem: function(type, id) {
                var ids, index;
                
                // id = 6
                //data.allItems[type][id];
                // ids = [1 2 4  8]
                //index = 3
                
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });
    
                index = ids.indexOf(id);
    
                if (index !== -1) {
                    data.allItems[type].splice(index, 1);
                }
                
            },

            calculateBudget: function() {

                // calculate total income & expenses
                calculateTotal('exp');
                calculateTotal('inc');

                // calculate budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

                // calculate percentages of income that has been spent
                if(data.totals.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }
        
            },

            calculatePercentages: function() {
                // expenses example:
                // a = 20, b = 10, c = 40, income total = 100
                // a = 20/100 = 20%
                // b = 10/100 = 10%
                // c = 40/100 = 40%

                data.allItems.exp.forEach(function(curr) {
                    curr.calcPercentage(data.totals.inc);
                });
            },

            getPercentages: function() {

                var allPerc = data.allItems.exp.map(function(curr) {
                    return curr.getPercentage();
                });
                return allPerc;
            },

            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };
            },
            testing: function() {
                console.log(data);
            }
        };

}()); 

////////////
/* UI CONTROLLER MODULE */
////////////
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
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        // + or - before number
        // exactly 2 decimal points after
        // comma separating thousands 
        // 2000 -> 2,000.00

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3); //result: if input is 2310, output will be 2,310 
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +  dec;

    };

    return { // make global access  objects/variables
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            // get everything that's in the fields, which is a list not an array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +  DOMstrings.inputValue);

            // turn the fields list into an array and duplicate it(slice)
            fieldsArray = Array.prototype.slice.call(fields);

            // loop simply through each item in fields array and clear the fields
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            // when fields clear and reset the focus is back on Description box, not value
            //*** [0] is the first element of the fields array, which is inputDescription */
            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        getDOMstrings: function() { // this exposes DOMstrings object to public scope
            return DOMstrings;
        }
    }

}());

////////////
/* CONTROLLER MODULE */
////////////
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {   /// e = enter

            if (e.keyCode === 13 || event.which === 13) {
            
            ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    

    var updateBudget = function() {
            // 1. Calculate budget
            budgetCtrl.calculateBudget();

            // 2. Return the budget
            var budget = budgetCtrl.getBudget();

            // 3. Display budget in UI
            UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentgaes from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

            // TO DO LIST:

            // 1. Get field input data
            input = UICtrl.getInput();

                //update input only if it is not 0/empty
            if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
                // 2. Add item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                // 3. Add new item to UI 
                UICtrl.addListItem(newItem, input.type);

                // 4. Clear fields
                UICtrl.clearFields();

                // 5. Calculate & update budget
                updateBudget();

                // 6. Calculate and update percentages
                updatePercentages();
            }
    };


     var ctrlDeleteItem = function(e) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        // Bubble up the DOM tree to select not the specific element clicked on but its parent. In this case we want to select the whole item that is to be deleted, not just the delete button. So based on the HTML we need to go up 4 elements to get to the item container, so we quadruple our parentNode property.
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
    
        }
    };

    return {
        init: function() { // init contains all functions that we want to run immediately when the app starts
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };
 

}(budgetController, UIController));


controller.init();




