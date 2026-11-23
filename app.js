const dbRequest = indexedDB.open("SciOlyDB", 2);
dbRequest.onupgradeneeded = function(event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("students")) {
        db.createObjectStore("students", {
            keyPath: "id",
            autoIncrement: true
        });
    }

    if (!db.objectStoreNames.contains("assignments")) {
        const assignmentStore = db.createObjectStore("assignments", {
            keyPath: "id",
            autoIncrement: true
        });

        assignmentStore.createIndex(
            "teamDivisionEvent",
            ["team", "division", "event"],
            { unique: false }
        );
    }
};

dbRequest.onsuccess = function(event) {
    console.log("SciOly database opened successfully!");

    const db = event.target.result;
    const transaction = db.transaction("students", "readonly");
    const studentStore = transaction.objectStore("students");

    const request = studentStore.getAll();

    request.onsuccess = function(event) {
        const savedStudents = request.result;

        savedStudents.forEach(function(student) {
            teams[student.team].push(student);
        });
        
        showStudents();
        showAssignmentStudents();
        showAssignedStudents();
    };
};

const teamSelect = document.getElementById("teamSelect");
const teamName = document.getElementById("teamName");
const teamInfo = document.getElementById("teamInfo");

teamSelect.addEventListener("change", function(){
    const selectedTeam = teamSelect.value;

    teamName.textContent = selectedTeam;
    teamInfo.textContent = "Currently viewing " + selectedTeam;
    showStudents();
    showAssignmentStudents();
    showAssignedStudents();
});

const studentInput = document.getElementById("studentName");
const studentGrade = document.getElementById("studentGrade");
const studentStatus = document.getElementById("studentStatus");

const addStudentButton = document.getElementById("addStudent");
const studentList = document.getElementById("studentList");
const alternateList = document.getElementById("alternateList");

const mainRosterTitle = document.getElementById("mainRosterTitle");
const alternateRosterTitle = document.getElementById("alternateRosterTitle");
const seniorCount = document.getElementById("seniorCount");

const teams = {
    "Varsity": [],
    "Junior Varsity 1": [],
    "Junior Varsity 2": []
};

addStudentButton.addEventListener("click", function(){
    const name = studentInput.value.trim();
    const grade = Number(studentGrade.value);
    const status = studentStatus.value;
    const selectedTeam = teamSelect.value;

    if (name === "") {
        alert("Please enter a student name.");
        return;
    }

    if (!studentGrade.value) {
        alert("Please enter a student name.");
        return;
    }

    const currentStudents = teams[selectedTeam];

    const mainStudent = currentStudents.filter(function(student) {
        return student.status !== "alternate";
    });

    const seniorCount = mainStudents.filter(function(student) {
        return student.grade === 12;
    }).length;

    if (status === "main" && mainStudents.length >= 15) {
        alert("The main roster is full (15 students).");
        return;
    }

    if (status === "main" && grade === 12 && seniorCount >= 7) {
        alert("The main roster already has 7 seniors.");
        return;
    }

    const transaction = dbRequest.result.transaction("students", "readwrite");
    const studentStore = transaction.objectStore("students");

    const addRequest = studentStore.add({
        name: name,
        team: selectedTeam,
        grade: grade,
        status: status
    });

    addRequest.onsuccess = function() {
        const student = {
            id: addRequest.result,
            name: name,
            team: selectedTeam,
            grade: grade,
            status: status
        };

        team[selectedTeam].push(student);

        showStudents();
        showAssignmentStudents();
    };

    studentInput.value = "";
    studentGrade.value = "";
});

function showStudents() {
    studentList.innerHTML = "";
    alternateList.innerHTML = "";

    const selectedTeam = teamSelect.value;
    const students = teams[selectedTeam];

    const mainStudents = students.filter(function(students) {
        return student.status !== "alternate";
    });

    const alternates = students.filter(function(student) {
        return student.status === "alternate";
    });

    const seniors = mainStudents.filter(function(students) {
        return students.grade === 12;
    });

    mainRosterTitle.textContent = 
        "Main Roster (" + mainStudents.length + "/15)";

    seniorCount.textContent = 
        "Seniors: " + seniors.length + "/7";

    alternateRosterTitle.textContent = 
        "Alternates (" + alternates.length = ")";

    function addStudentToList(student, list) {
        const item = document.createElement("li");
        item.textContent = student.name + " ";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteStudent(student.id);
        });

        item.appendChild(deleteButton);
        list.appendChild(item);
    }

    mainStudents.forEach(function(student) {
        addStudentToList(student, studentList);
    });

    alternates.forEach(function(student) {
        addStudentToList(student, alternateList);
    });
}

function deleteStudent(studentId) {
    const transaction = dbRequest.result.transaction("students", "readwrite");
    const studentStore = transaction.objectStore("students");

    const deleteRequest = studentStore.delete(studentId);

    deleteRequest.onsuccess = function() {
        for (const team in teams) {
            teams[team] = teams[team].filter(function(student) {
                return student.id !== studentId;
            });
        }

        showStudents();
        showAssignmentStudents();
    };
}

const divisionCEvents = [
    "Anatomy and Physiology",
    "Astronomy",
    "Boomilever",
    "Botany",
    "Chemistry Lab",
    "Circuit Lab",
    "Codebusters",
    "Designer Genes",
    "Disease Detectives",
    "Dynamic Planet",
    "Electric Vehicle",
    "Engineering CAD",
    "Experimental Design",
    "Forensics",
    "Hovercraft",
    "Mission Possible",
    "Ping Pong Parachute",
    "Protein Modeling",
    "Remote Sensing",
    "Rocks and Minerals",
    "Thermodynamics",
    "Water Quality",
    "Wright Stuff"
];

const divisionBEvents = [
    "Anatomy and Physiology",
    "Boomilever",
    "Botany",
    "Circuit Lab",
    "Codebusters",
    "Crime Busters",
    "Disease Detectives",
    "Dynamic Planet",
    "Elastic Launched Glider",
    "Experimental Design",
    "Food Science",
    "Heredity",
    "Hovercraft",
    "Meteorology",
    "Ping Pong Parachute",
    "Remote Sensing",
    "Rocks and Minerals",
    "Roller Coaster",
    "Scrambler",
    "Solar System",
    "Thermodynamics",
    "Water Quality",
    "Write It Do It",
];

const eventLimits = {
    "Codebusters" : 3,
    "Experimental Design" : 3,
};

function getEventLimit(eventName) {
    return eventLimits[eventName] || 2;
}

const divisionSelect = document.getElementById("divisionSelect");
const eventSelect = document.getElementById("eventSelect");
const eventCapacity = document.getElementById("eventCapacity");

const assignmentStudent = document.getElementById("assignmentStudent");
const assignStudentButton = document.getElementById("assignStudentButton");
const assignedStudentList = document.getElementById("assignedStudentList");

function showEvents() {
    eventSelect.innerHTML = "";

    const events = divisionSelect.value === "C"
        ? divisionCEvents 
        : divisionBEvents;

    events.forEach(function(eventName) {
        const option = document.createElement("option");
        option.value = eventName;
        option.textContent = eventName;
        eventSelect.appendChild(option);
    });

    showEventCapacity(); 
}

function showEventCapacity() {
    const eventName = eventSelect.value;
    const limit = getEventLimit(eventName);

    eventCapacity.textContent = "Maximum students: " + limit;
}

divisionSelect.addEventListener("change", function() {
    showEvents();
    showAssignedStudents();
});

eventSelect.addEventListener("change", showAssignedStudents);

showEvents();

function showAssignmentStudents() {
    assignmentStudent.innerHTML = "";

    const selectedTeam = teamSelect.value;

    teams[selectedTeam].forEach(function(student){
        const option = document.createElement("option");

        option.value = student.id;
        option.textContent = student.name;

        assignmentStudent.appendChild(option);
    });
}

showAssignmentStudents();

function showAssignedStudents() {
    const db = dbRequest.result;

    const transaction = db.transaction("assignments", "readonly");
    const assignmentStore = transaction.objectStore("assignments");

    const index = assignmentStore.index("teamDivisionEvent");

    const selectedTeam = teamSelect.value;
    const selectedDivision = divisionSelect.value;
    const selectedEvent = eventSelect.value;

    const request = index.getAll([
        selectedTeam,
        selectedDivision,
        selectedEvent
    ]);

    request.onsuccess = function() {
        const assignments = request.result;

        console.log("Loaded assignments:", assignments);

        assignedStudentList.innerHTML = "";

        assignments.forEach(function(assignment) {
            const item = document.createElement("li");
            item.textContent = assignment.studentName;
            assignedStudentList.appendChild(item);
        });

        const limit = getEventLimit(selectedEvent);
        const remaining = limit - assignments.length;

        eventCapacity.textContent = 
            assignments.length + "/" + limit + 
            " assigned - " + remaining + " slots left";
    };
}

assignStudentButton.addEventListener("click", function() {
    const studentId = Number(assignmentStudent.value);
    const selectedTeam = teamSelect.value;
    const selectedDivision = divisionSelect.value;
    const selectedEvent = eventSelect.value;

    if (!studentId) {
        alert("Please select a student first.");
        return;
    }

    const db = dbRequest.result;
    const transaction = db.transaction("assignments", "readwrite");
    const store = transaction.objectStore("assignments");
    const index = store.index("teamDivisionEvent");

    const request = index.getAll([
        selectedTeam,
        selectedDivision,
        selectedEvent
    ]);

    request.onsuccess = function() {
        const assignments = request.result;
        const limit = getEventLimit(selectedEvent);

        if (assignments.length >= limit) {
            alert("This event is already full!");
            return;
        }

        const alreadyAssigned = assignments.some(function(assignment) {
            return assignment.studentId === studentId;
        });

        if (alreadyAssigned) {
            alert("This student is already assigned to this event!");
            return;
        }

        const student = teams[selectedTeam].find(function(s) {
            return s.id === studentId;
        });

        if(!student) {
            alert("Student not found.");
            return;
        }

        const addRequest = store.add({
            studentId: student.id,
            studentName: student.name,
            team: selectedTeam,
            division: selectedDivision,
            event: selectedEvent
        });

        transaction.oncomplete = function() {
            showAssignedStudents();
        };
    };
});

