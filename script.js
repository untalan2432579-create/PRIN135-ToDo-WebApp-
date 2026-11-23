
// ==========================================
// SELECT HTML ELEMENTS
// ==========================================

const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const hoursInput = document.getElementById('hoursInput');

const taskList = document.getElementById('taskList');

const itemsLeft = document.getElementById('itemsLeft');
const allHoursDisplay = document.getElementById('allHours');
const remainingHoursDisplay = document.getElementById('remainingHours');

const toggleAllButton = document.getElementById('toggleAllButton');
const clearCompletedButton = document.getElementById('clearCompletedButton');

const filterButtons = document.querySelectorAll('.filter');


// ==========================================
// INITIAL TASKS
// ==========================================

let tasks = [
    {
        id: 1,
        text: 'Learn variables',
        hours: 1,
        completed: true
    },
    {
        id: 2,
        text: 'Learn data types',
        hours: 2.5,
        completed: false
    },
    {
        id: 3,
        text: 'Learn Functions',
        hours: 6,
        completed: false
    }
];

let currentFilter = 'all';
let nextId = 4;


// ==========================================
// AUTOMATIC DIFFICULTY CLASSIFICATION
// ==========================================

function getDifficulty(hours) {

    if (hours <= 2) {
        return {
            label: 'Easy',
            className: 'easy'
        };
    }

    if (hours <= 5) {
        return {
            label: 'Medium',
            className: 'medium'
        };
    }

    return {
        label: 'Hard',
        className: 'hard'
    };
}


// ==========================================
// FORMAT HOURS
// ==========================================

function formatHours(hours) {
    return Number(hours.toFixed(2)).toString();
}


// ==========================================
// FILTER TASKS
// ==========================================

function getVisibleTasks() {

    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}


// ==========================================
// DISPLAY TASKS
// ==========================================

function renderTasks() {

    taskList.innerHTML = '';

    const visibleTasks = getVisibleTasks();

    visibleTasks.forEach(task => {

        const row = document.createElement('li');

        row.className = `task-row ${task.completed ? 'completed' : ''}`;


        // CHECKBOX

        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;

        checkbox.addEventListener('change', () => {

            task.completed = checkbox.checked;

            renderTasks();

        });


        // TASK NAME - TASK A

        const text = document.createElement('span');

        text.className = 'task-text';
        text.textContent = task.text;

        // Double-click to edit task text
        text.addEventListener('dblclick', () => {

            editTaskText(task, text);

        });


        // AUTOMATIC DIFFICULTY LABEL

        const difficultyInfo = getDifficulty(task.hours);

        const difficulty = document.createElement('span');

        difficulty.className = `difficulty ${difficultyInfo.className}`;

        difficulty.textContent =
            `${difficultyInfo.label} · ${formatHours(task.hours)}h`;


        // TASK B - EDIT HOURS

        // Double-click the difficulty label to edit hours
        difficulty.addEventListener('dblclick', () => {

            editTaskHours(task, difficulty);

        });


        // DELETE BUTTON

        const deleteButton = document.createElement('button');

        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '×';
        deleteButton.setAttribute('aria-label', 'Delete task');

        deleteButton.addEventListener('click', () => {

            tasks = tasks.filter(item => item.id !== task.id);

            renderTasks();

        });


        // ADD ELEMENTS TO TASK ROW

        row.append(
            checkbox,
            text,
            difficulty,
            deleteButton
        );

        taskList.appendChild(row);

    });

    updateFooter();

}


// ==========================================
// UPDATE FOOTER TOTALS
// ==========================================

function updateFooter() {

    // COUNT UNFINISHED TASKS

    const activeTasks = tasks.filter(task => !task.completed);


    // TOTAL HOURS OF ALL TASKS

    const allTaskHours = tasks.reduce(
        (total, task) => total + task.hours,
        0
    );


    // REMAINING HOURS OF UNFINISHED TASKS

    const remainingHours = activeTasks.reduce(
        (total, task) => total + task.hours,
        0
    );


    // DISPLAY UPDATED TOTALS

    itemsLeft.textContent =
        `${activeTasks.length} items left`;

    allHoursDisplay.textContent =
        `${formatHours(allTaskHours)} hours total`;

    remainingHoursDisplay.textContent =
        `${formatHours(remainingHours)} hours remaining`;

}


// ==========================================
// TASK A - EDIT TASK TEXT
// ==========================================

function editTaskText(task, oldElement) {

    const input = document.createElement('input');

    input.type = 'text';
    input.className = 'edit-input';
    input.value = task.text;

    // Replace task text with an editable input
    startEditing(oldElement, input, value => {

        const newText = value.trim();

        // Delete task if the saved text is empty
        if (newText === '') {

            tasks = tasks.filter(
                item => item.id !== task.id
            );

        } else {

            task.text = newText;

        }

        renderTasks();

    });

}


// ==========================================
// TASK B - EDIT TASK HOURS
// ==========================================

function editTaskHours(task, oldElement) {

    const input = document.createElement('input');

    input.type = 'number';
    input.min = '0';
    input.step = '0.5';

    input.className = 'edit-input edit-hours';

    input.value = task.hours;

    // Replace difficulty label with a number input
    startEditing(oldElement, input, value => {

        // Blank entry counts as 0
        if (value.trim() === '') {

            task.hours = 0;

        } else {

            const newHours = Number(value);

            task.hours = Number.isFinite(newHours)
                ? Math.max(0, newHours)
                : 0;

        }

        // Re-render to update difficulty and footer totals
        renderTasks();

    });

}


// ==========================================
// SHARED EDITING FUNCTION
// ENTER = SAVE
// ESC = CANCEL
// CLICK AWAY = SAVE
// ==========================================

function startEditing(oldElement, input, saveChanges) {

    oldElement.replaceWith(input);

    // Automatically focus and select existing value
    input.focus();
    input.select();

    let finished = false;

    function finish(save) {

        // Prevent saving or cancelling more than once
        if (finished) return;

        finished = true;

        if (save) {

            saveChanges(input.value);

        } else {

            // Restore the original task display
            renderTasks();

        }

    }


    // KEYBOARD SHORTCUTS

    input.addEventListener('keydown', event => {

        if (event.key === 'Enter') {

            event.preventDefault();
            finish(true);

        }

        if (event.key === 'Escape') {

            event.preventDefault();
            finish(false);

        }

    });


    // SAVE WHEN CLICKING AWAY

    input.addEventListener('blur', () => {

        finish(true);

    });

}


// ==========================================
// ADD NEW TASK
// ==========================================

todoForm.addEventListener('submit', event => {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === '') {

        taskInput.focus();

        return;

    }

    const hours = hoursInput.value.trim() === ''
        ? 0
        : Math.max(0, Number(hoursInput.value) || 0);


    // CREATE NEW TASK

    tasks.push({

        id: nextId++,
        text: text,
        hours: hours,
        completed: false

    });


    // RESET INPUT FIELDS

    taskInput.value = '';
    hoursInput.value = '';


    // SHOW ALL TASKS AFTER ADDING

    currentFilter = 'all';

    filterButtons.forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.filter === 'all'
        );

    });


    renderTasks();

    taskInput.focus();

});


// ==========================================
// ALL / ACTIVE / COMPLETED FILTERS
// ==========================================

filterButtons.forEach(button => {

    button.addEventListener('click', () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {

            filterButton.classList.toggle(
                'active',
                filterButton === button
            );

        });

        renderTasks();

    });

});


// ==========================================
// MARK ALL TASKS AS DONE
// ==========================================

toggleAllButton.addEventListener('click', () => {

    tasks.forEach(task => {

        task.completed = true;

    });

    renderTasks();

});


// ==========================================
// CLEAR COMPLETED TASKS
// ==========================================

clearCompletedButton.addEventListener('click', () => {

    tasks = tasks.filter(task => !task.completed);

    renderTasks();

});


// ==========================================
// INITIAL DISPLAY
// ==========================================

renderTasks();
