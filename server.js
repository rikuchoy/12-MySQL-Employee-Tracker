const inquirer = require('inquirer');
const db = require('./db/connection');

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    employee_tracker();
});

const employee_tracker = function () {
    inquirer.prompt([
        {
            // Begin Command Line
            type: 'list',
            name: 'prompt',
            message: 'What would you like to do?',
            choices: [
                'View All Department',
                'View All Roles',
                'View All Employees',
                'Add A Department',
                'Add A Role',
                'Add An Employee',
                'Update An Employee Role',
                'Log Out'
            ]
        }
    ]).then((answers) => {
        // Views the Department Table in the Database
        if (answers.prompt === 'View All Department') {
            db.query(`SELECT * FROM department`, (err, result) => {
                if (err) throw err;
                console.log("Viewing All Departments: ");
                console.table(result);
                employee_tracker();
            });
        } else if (answers.prompt === 'View All Roles') {
            db.query(`SELECT * FROM role`, (err, result) => {
                if (err) throw err;
                console.log("Viewing All Roles: ");
                console.table(result);
                employee_tracker();
            });
        } else if (answers.prompt === 'View All Employees') {
            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) throw err;
                console.log("Viewing All Employees: ");
                console.table(result);
                employee_tracker();
            });
        } else if (answers.prompt === 'Add A Department') {
            inquirer.prompt([
                {
                    // Adding a Department
                    type: 'input',
                    name: 'department',
                    message: 'What is the name of the department?',
                    validate: departmentInput => {
                        if (departmentInput) {
                            return true;
                        } else {
                            console.log('Please Add A Department!');
                            return false;
                        }
                    }
                }
            ]).then((answers) => {
                db.query(`INSERT INTO department (name) VALUES (?)`, [answers.department], (err, result) => {
                    if (err) throw err;
                    console.log(`Added ${answers.department} to the database.`)
                    employee_tracker();
                });
            });
        } else if (answers.prompt === 'Add A Role') {
            db.query(`SELECT * FROM department`, (err, result) => {
                if (err) throw err;

                inquirer.prompt([
                    {
                        // Adding A Role
                        type: 'input',
                        name: 'role',
                        message: 'What is the name of the role?',
                        validate: roleInput => {
                            if (roleInput) {
                                return true;
                            } else {
                                console.log('Please Add A Role!');
                                return false;
                            }
                        }
                    },
                    {
                        // Adding the Salary
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the role?',
                        validate: salaryInput => {
                            if (salaryInput) {
                                return true;
                            } else {
                                console.log('Please Add A Salary!');
                                return false;
                            }
                        }
                    },
                    {
                        // Department
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the role belong to?',
                        choices: () => {
                            var array = [];
                            for (var i = 0; i < result.length; i++) {
                                array.push(result[i].name);
                            }
                            return array;
                        }
                    }
                ]).then((answers) => {
                    // Comparing the result and storing it into the variable
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].name === answers.department) {
                            answers.department_id = result[i].id;
                        }
                    }
                    db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answers.role, answers.salary, answers.department_id], (err, result) => {
                        if (err) throw err;
                        console.log(`Added ${answers.role} to the database.`)
                        employee_tracker();
                    });
                });
            });
        } else if (answers.prompt === 'Add An Employee') {
                db.query(`SELECT * FROM role`, (err, roleResult) => {
                    if (err) throw err;
            
                    db.query(`SELECT * FROM employee`, (err, employeeResult) => {
                        if (err) throw err;
            
                        inquirer.prompt([
                            {
                                // Employee First Name
                                type: 'input',
                                name: 'first_name',
                                message: 'What is the employee\'s first name?',
                                validate: firstNameInput => {
                                    if (firstNameInput) {
                                        return true;
                                    } else {
                                        console.log('Please Add A First Name!');
                                        return false;
                                    }
                                }
                            },
                            {
                                // Employee Last Name
                                type: 'input',
                                name: 'last_name',
                                message: 'What is the employee\'s last name?',
                                validate: lastNameInput => {
                                    if (lastNameInput) {
                                        return true;
                                    } else {
                                        console.log('Please Add A Last Name!');
                                        return false;
                                    }
                                }
                            },
                            {
                                // Employee Role
                                type: 'list',
                                name: 'role',
                                message: 'What is the employee\'s role?',
                                choices: () => {
                                    var array = [];
                                    for (var i = 0; i < roleResult.length; i++) {
                                        array.push(roleResult[i].title);
                                    }
                                    var newArray = [...new Set(array)];
                                    return newArray;
                                }
                            },
                            {
                                // Employee Manager
                                type: 'list',
                                name: 'manager',
                                message: 'Who is the employee\'s manager?',
                                choices: () => {
                                    var array = ['None'];
                                    for (var i = 0; i < employeeResult.length; i++) {
                                        array.push(employeeResult[i].last_name);
                                    }
                                    return array;
                                }
                            }
                        ]).then((answers) => {
                            var role_id;
                            var manager_id;
                            for (var i = 0; i < roleResult.length; i++) {
                                if (roleResult[i].title === answers.role) {
                                    role_id = roleResult[i].id;
                                }
                            }
                            for (var i = 0; i < employeeResult.length; i++) {
                                if (answers.manager === employeeResult[i].last_name) {
                                    manager_id = employeeResult[i].id;
                                }
                            }
                            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.first_name, answers.last_name, role_id, manager_id], (err, result) => {
                                if (err) throw err;
                                console.log(`Added ${answers.first_name} ${answers.last_name} to the database.`)
                                employee_tracker();
                            });
                        });
                    });
                });
        } else if (answers.prompt === 'Update An Employee Role') {
            db.query(`SELECT * FROM employee`, (err, employeeResult) => {
                if (err) throw err;
                db.query(`SELECT * FROM role`, (err, roleResult) => {
                    if (err) throw err;

                    inquirer.prompt([
                        {
                            // Select Employee
                            type: 'list',
                            name: 'employee',
                            message: 'Which employee\'s role would you like to update?',
                            choices: () => {
                                var array = [];
                                for (var i = 0; i < employeeResult.length; i++) {
                                    array.push(employeeResult[i].last_name);
                                }
                                return array;
                            }
                        },
                        {
                            // New Role
                            type: 'list',
                            name: 'role',
                            message: 'What is the employee\'s new role?',
                            choices: () => {
                                var array = [];
                                for (var i = 0; i < roleResult.length; i++) {
                                    array.push(roleResult[i].title);
                                }
                                return array;
                            }
                        }
                    ]).then((answers) => {
                        var employee_id;
                        var role_id;
                        for (var i = 0; i < employeeResult.length; i++) {
                            if (employeeResult[i].last_name === answers.employee) {
                                employee_id = employeeResult[i].id;
                            }
                        }
                        for (var i = 0; i < roleResult.length; i++) {
                            if (roleResult[i].title === answers.role) {
                                role_id = roleResult[i].id;
                            }
                        }
                        db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, [role_id, employee_id], (err, result) => {
                            if (err) throw err;
                            console.log(`Updated ${answers.employee}'s role to ${answers.role}.`)
                            employee_tracker();
                        });
                    });
                });
            });
        } else if (answers.prompt === 'Log Out') {
            db.end();
            console.log('Logging out of the Employee Tracker.');
        }
    });
};



