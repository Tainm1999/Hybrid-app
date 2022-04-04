var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);

    db.transaction(function (tx) {
        // Create table POST.
        var query = `CREATE TABLE IF NOT EXISTS Post (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            Property_name TEXT NOT NULL UNIQUE,
                                                            Property_address TEXT NOT NULL,
                                                            Property_type TEXT NOT NULL,
                                                            Bedroom TEXT NOT NULL,
                                                            Date DATE NOT NULL,
                                                            Time TIME NOT NULL,
                                                            Rent_Price TEXT NOT NULL,
                                                            Furniture_type TEXT NOT NULL,
                                                            Note TEXT NOT NULL,
                                                            Reporter TEXT NOT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Post' successfully.`);
        }, transactionError);

        // Create table COMMENT.
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Comment TEXT NOT NULL,
                                                         Datetime DATE NOT NULL,
                                                         PostId INTEGER NOT NULL,
                                                         FOREIGN KEY (PostId) REFERENCES Post(Id))`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Comment' successfully.`);
        }, transactionError);
    });
}

// Submit a form to register a new post.
$(document).on('submit', '#page-create #frm-register', confirmPost);
$(document).on('submit', '#page-create #frm-confirm', registerPost);

function confirmPost(e) {
    e.preventDefault();

    // Get post input.
    var propertyname = $('#page-create #frm-register #Property_name').val();
    var propertyaddress = $('#page-create #frm-register #Property_address').val();
    var propertytype = $('#page-create #frm-register #Property_type').val();
    var bedroom = $('#page-create #frm-register #Bedroom').val();
    var date = $('#page-create #frm-register #date').val();
    var time = $('#page-create #frm-register #time').val();
    var rentprice = $('#page-create #frm-register #Rent_Price').val();
    var furnituretype = $('#page-create #frm-register #Furniture_type').val();
    var note = $('#page-create #frm-register #Note').val();
    var reportername = $('#page-create #frm-register #Reporter_name').val();


    if (checkPost(propertyname)) {
        alert('Post existed');
    }
    else {
        checkPost(propertyname, propertyaddress, propertytype, bedroom, date, time, rentprice, furnituretype, note, reportername);
    }
}

function checkPost(propertyname, propertyaddress, propertytype, bedroom, date, time, rentprice, furnituretype, note, reportername) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Post WHERE Property_name = ?';
        tx.executeSql(query, [propertyname], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');

                $('#page-create #error').empty();

                $('#page-create #frm-confirm #Property_name').val(propertyname);
                $('#page-create #frm-confirm #Property_address').val(propertyaddress);
                $('#page-create #frm-confirm #Property_type').val(propertytype);
                $('#page-create #frm-confirm #Bedroom').val(bedroom);
                $('#page-create #frm-confirm #date').val(date);
                $('#page-create #frm-confirm #time').val(time);
                $('#page-create #frm-confirm #Rent_Price').val(rentprice);
                $('#page-create #frm-confirm #Furniture_type').val(furnituretype);
                $('#page-create #frm-confirm #Note').val(note);
                $('#page-create #frm-confirm #Reporter_name').val(reportername);

                $('#page-create #frm-confirm').popup('open');
            }
            else {
                var error = 'Post exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerPost(e) {
    e.preventDefault();

    var propertyname = $('#page-create #frm-confirm #Property_name').val();
    var propertyaddress = $('#page-create #frm-confirm #Property_address').val();
    var propertytype = $('#page-create #frm-confirm #Property_type').val();
    var bedroom = $('#page-create #frm-confirm #Bedroom').val();
    var date = $('#page-create #frm-confirm #date').val();
    var time = $('#page-create #frm-confirm #time').val();
    var rentprice = $('#page-create #frm-confirm #Rent_Price').val();
    var furnituretype = $('#page-create #frm-confirm #Furniture_type').val();
    var note = $('#page-create #frm-confirm #Note').val();
    var reportername = $('#page-create #frm-confirm #Reporter_name').val();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Post (Property_name, Property_address, Property_type, Bedroom, Date, Time, Rent_Price, Furniture_type, Note, Reporter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(query, [propertyname, propertyaddress, propertytype, bedroom, date, time, rentprice, furnituretype, note, reportername], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a propertyName '${propertyname}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#propertyname').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

// Display Post List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, Property_name, Property_address, Property_type, Bedroom, Date, Time, Rent_Price, Reporter FROM Post';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of posts successfully.`);

            // Prepare the list of posts.
            var listPost = `<ul id='list-post' data-role='listview' data-filter='true' data-filter-placeholder='Search posts...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let post of result.rows) {
                listPost += `<li><a data-details='{"Id" : ${post.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Property Name: ${post.Property_name}</h3>
                                    <h3>Property address: ${post.Property_address}</h3>
                                    <h3>Property type: ${post.Property_type}</h3>
                                    <h3>Bedroom: ${post.Bedroom}</h3>
                                    <h3>Date: ${post.Date}</h3>
                                    <h3>Time: ${post.Time}</h3>
                                    <h3>Rent Price: ${post.Rent_Price}</h3>
                                    <h3>Reporter: ${post.Reporter}</h3>
                                    <p>ID: ${post.Id}</p>
                                </a></li>`;
            }
            listPost += `</ul>`;

            // Add list to UI.
            $('#list-post').empty().append(listPost).listview('refresh').trigger('create');

            log(`Show list of posts successfully.`);
        }
    });
}

// Save Post Id.
$(document).on('vclick', '#list-post li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentPostId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Post Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentPostId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Post WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Post not found.';
            var propertyname = errorMessage;
            var propertyaddress = errorMessage;
            var propertytype = errorMessage;
            var bedroom = errorMessage;
            var date = errorMessage;
            var time = errorMessage;
            var rentprice = errorMessage;
            var furnituretype = errorMessage;
            var note = errorMessage;
            var reportername = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of post '${id}' successfully.`);

                propertyname = result.rows[0].Property_name;
                propertyaddress = result.rows[0].Property_address;
                propertytype = result.rows[0].Property_type;
                bedroom = result.rows[0].Bedroom;
                date = result.rows[0].Date;
                time = result.rows[0].Time;
                rentprice = result.rows[0].Rent_Price;
                furnituretype = result.rows[0].Furniture_type;
                note = result.rows[0].Note;
                reportername = result.rows[0].Reporter;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').val(id);
            $('#page-detail #Property_name').val(propertyname);
            $('#page-detail #Property_address').val(propertyaddress);
            $('#page-detail #Property_type').val(propertytype);
            $('#page-detail #Bedroom').val(bedroom);
            $('#page-detail #date').val(date);
            $('#page-detail #time').val(time);
            $('#page-detail #Rent_Price').val(rentprice);
            $('#page-detail #Furniture_type').val(furnituretype);
            $('#page-detail #Note').val(note);
            $('#page-detail #Reporter_name').val(reportername);

            showComment();
        }
    });
}

//update Post
$(document).on('vclick', '#page-detail #btn-update', updatePost);

function updatePost() {
    var id = localStorage.getItem('currentPostId');
    var propertyname = $('#page-detail #frm-update #propertyname-update').val();
    var propertyaddress = $('#page-detail #frm-update #propertyaddress-update').val();
    var propertytype = $('#page-detail #frm-update #propertytype-update').val();
    var bedroom = $('#page-detail #frm-update #bedroom-update').val();
    var date = $('#page-detail #frm-update #date-update').val();
    var time = $('#page-detail #frm-update #time-update').val();
    var rentprice = $('#page-detail #frm-update #rentprice-update').val();
    var furnituretype = $('#page-detail #frm-update #furnituretype-update').val();
    var note = $('#page-detail #frm-update #note-update').val();
    var reportername = $('#page-detail #frm-update #reportername-update').val();

    

    db.transaction(function (tx) {

        var query = "UPDATE Post set Property_name = ?, Property_address = ?, Property_type = ?, Bedroom = ?, Date = ?, Time = ?, Rent_Price = ?, Furniture_type = ?, Note = ?, Reporter = ?   WHERE id = ?";  
        tx.executeSql(query, [propertyname,propertyaddress,propertytype,bedroom,date,time,rentprice,furnituretype,note, reportername, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update Post '${id}' successfully.`);

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

// Delete Post.
$(document).on('submit', '#page-detail #frm-delete', deletePost);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeletePost);

function confirmDeletePost() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deletePost(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentPostId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Post WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete post '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

// Add Comment.
$(document).on('submit', '#page-detail #frm-comment', addComment);

function addComment(e) {
    e.preventDefault();

    var postId = localStorage.getItem('currentPostId');
    var comment = $('#page-detail #frm-comment #txt-comment').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (PostId, Comment, Datetime) VALUES (?, ?, ?)';
        tx.executeSql(query, [postId, comment, dateTime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to post '${postId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}

// Show Comment.
function showComment() {
    var postId = localStorage.getItem('currentPostId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE PostId = ?';
        tx.executeSql(query, [postId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            var listComment = '';
            for (let comment of result.rows) {
                listComment += `<div class = 'list'>
                                    <small>${comment.Datetime}</small>
                                    <h3>${comment.Comment}</h3>
                                </div>`;
            }

            // Add list to UI.
            $('#list-comment').empty().append(listComment);

            log(`Show list of comments successfully.`);
        }
    });
}

//search
$(document).on('submit', '#page-search #frm-search', search);

function search(e) {
    e.preventDefault();

    var propertyname = $('#page-search #frm-search #Property_name').val();
    var propertyaddress = $('#page-search #frm-search #Property_address').val();
    var propertytype = $('#page-search #frm-search #Property_type').val();
    var bedroom = $('#page-search #frm-search #Bedroom').val();
    var rentprice = $('#page-search #frm-search #Rent_Price').val();
    var furnituretype = $('#page-search #frm-search #Furniture_type').val();




    db.transaction(function (tx) {
        var query = `SELECT Property_name, Property_address, Property_type, Bedroom, Rent_Price, Furniture_type FROM Post WHERE`;

        if (propertyname){
            query += ` Property_name LIKE "%${propertyname}%"   AND`;
        }

        if (propertyaddress){
            query += ` Property_address LIKE "%${propertyaddress}%"   AND`;
        }

        if (propertytype){
            query += ` Property_type LIKE "%${propertytype}%"   AND`;
        }

        if (bedroom){
            query += ` Bedroom LIKE "%${bedroom}%"   AND`;
        }

        if (rentprice){
            query += ` Rent_Price LIKE ${rentprice}   AND`;
        }

        if (furnituretype){
            query += ` Furniture_type LIKE "%${furnituretype}%"   AND`;
        }

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of posts successfully.`);
            // Prepare the list of posts.
            var listPost = `<br>`;
            for (let post of result.rows) {
                listPost += `<li><a data-details='{"Id" : ${post.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Property Name: ${post.Property_name}</h3>
                                    <h3>Property address: ${post.Property_address}</h3>
                                    <h3>Property type: ${post.Property_type}</h3>
                                    <h3>Bedroom: ${post.Bedroom}</h3>
                                    <h3>Rent Price: ${post.Rent_Price}</h3>
                                    <h3>Furniture Type: ${post.Furniture_type}</h3>
                                </a></li>`;
            }
            listPost += `</ul>`;
            // Add list to UI.
            $('#list-search').empty().append(listPost).listview('refresh').trigger('create');

            log(`Show list of posts successfully.`);
        }
    });
}