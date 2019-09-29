////////////
/* BUDGET CONTROLLER MODULE */
////////////
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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
            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };
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
        expensesContainer: '.expenses__list'
    }

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

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
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
    };

    var updateBudget = function() {
            // 1. Calculate budget
            budgetCtrl.calculateBudget();

            // 2. Return the budget
            var budget = budgetCtrl.getBudget();

            // 3. Display budget in UI
            console.log(budget);
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
            }


    };

    return {
        init: function() { // init contains all functions that we want to run immediately when the app starts
            console.log('Application has started');
            setupEventListeners();
        }
    };
 

}(budgetController, UIController));


controller.init();




