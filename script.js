// Database Simulation

// Initialize books and requests in localStorage if not exists
function initializeBooks() {
    if (!localStorage.getItem('libraryBooks')) {
        const defaultBooks = [
            { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'Available', visible: true, checkedOutBy: null, dueDate: null },
            { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'Available', visible: true, checkedOutBy: null, dueDate: null }
        ];
        localStorage.setItem('libraryBooks', JSON.stringify(defaultBooks));
    }

    if (!localStorage.getItem('bookRequests')) {
        localStorage.setItem('bookRequests', JSON.stringify([]));
    }
}

// Get all books from storage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('libraryBooks')) || [];
}

// Get all requests from storage
function getRequestsFromStorage() {
    return JSON.parse(localStorage.getItem('bookRequests')) || [];
}

// Save books to storage
function saveBooksToStorage(books) {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Save requests to storage
function saveRequestsToStorage(requests) {
    localStorage.setItem('bookRequests', JSON.stringify(requests));
}

// Book Management Functions

function addBook(title, author, isbn) {
    const books = getBooksFromStorage();
    const newBook = {
        id: Date.now(),
        title,
        author,
        isbn,
        status: 'Available',
        visible: true,
        checkedOutBy: null,
        dueDate: null
    };
    books.push(newBook);
    saveBooksToStorage(books);
    loadBooks();
    loadAvailableBooks();
}

function removeBook(id) {
    const books = getBooksFromStorage();
    const updatedBooks = books.filter(book => book.id !== id);
    saveBooksToStorage(updatedBooks);
    loadBooks();
    loadAvailableBooks();
}

function checkoutBook(bookId) {
    const books = getBooksFromStorage();
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1 && books[bookIndex].status === 'Available') {
        books[bookIndex].status = 'Checked Out';
        books[bookIndex].checkedOutBy = currentUser.email;
        // Set due date to 2 weeks from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        books[bookIndex].dueDate = dueDate.toISOString();
        saveBooksToStorage(books);
        loadBooks();
        loadCheckedOutBooks();
        loadAvailableBooks();
        loadUserCheckedOutBooks();
        return true;
    }
    return false;
}

function checkinBook(bookId) {
    const books = getBooksFromStorage();
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1 && books[bookIndex].status === 'Checked Out') {
        books[bookIndex].status = 'Available';
        books[bookIndex].checkedOutBy = null;
        books[bookIndex].dueDate = null;
        saveBooksToStorage(books);
        loadBooks();
        loadCheckedOutBooks();
        loadAvailableBooks();
        loadUserCheckedOutBooks();
        return true;
    }
    return false;
}

function requestBook(title, author) {
    const requests = getRequestsFromStorage();
    const newRequest = {
        id: Date.now(),
        title,
        author,
        requestedBy: currentUser.email,
        date: new Date().toISOString(),
        status: 'Pending'
    };
    requests.push(newRequest);
    saveRequestsToStorage(requests);
    loadBookRequests();
    return newRequest;
}

// UI Rendering Functions

function loadLibrarianUI() {
    const userContent = document.getElementById('userContent');
    userContent.innerHTML = `
        <div class="container">
            <section class="form-section">
                <h2>Add New Book</h2>
                <form id="addBookForm">
                    <input type="text" id="bookTitle" placeholder="Title" required>
                    <input type="text" id="bookAuthor" placeholder="Author" required>
                    <input type="text" id="bookISBN" placeholder="ISBN" required>
                    <button type="submit">Add Book</button>
                </form>
            </section>

            <section>
                <h2>All Books</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="booksTableBody"></tbody>
                </table>
            </section>

            <section id="checkedOutBooks">
                <h2>Checked Out Books</h2>
                <!-- Content loaded dynamically -->
            </section>

            <section id="bookRequestsSection">
                <h2>Book Requests</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Requested By</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="bookRequestsBody"></tbody>
                </table>
            </section>
        </div>
    `;
    loadBooks();
    loadCheckedOutBooks();
    loadBookRequests();
}

function loadUserUI() {
    const userContent = document.getElementById('userContent');
    userContent.innerHTML = `
        <div class="container">
            <section class="search-section">
                <h2>Search Books</h2>
                <div>
                    <input type="text" id="searchInput" placeholder="Search by title or author">
                    <button id="searchBtn">Search</button>
                </div>
            </section>

            <section>
                <h2>Available Books</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="availableBooksBody"></tbody>
                </table>
            </section>

            <section>
                <h2>Your Checked Out Books</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Due Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="yourBooksBody"></tbody>
                </table>
            </section>

            <section class="form-section">
                <h2>Request a Book</h2>
                <form id="requestBookForm">
                    <input type="text" id="requestTitle" placeholder="Title" required>
                    <input type="text" id="requestAuthor" placeholder="Author" required>
                    <button type="submit">Submit Request</button>
                </form>
            </section>
        </div>
    `;
    loadAvailableBooks();
    loadUserCheckedOutBooks();
}

function loadBooks() {
    if (currentUser?.role !== 'librarian') return;

    const books = getBooksFromStorage();
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td class="status-cell ${book.status === 'Available' ? 'available' : 'checked-out'}">
                ${book.status}
            </td>
            <td>
                ${book.status === 'Available' ?
            `<button class="action-btn checkout-btn" onclick="checkoutBook(${book.id})">Check Out</button>` :
            `<button class="action-btn checkin-btn" onclick="checkinBook(${book.id})">Check In</button>`}
                <button class="action-btn delete-btn" onclick="removeBook(${book.id})">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadAvailableBooks() {
    if (currentUser?.role !== 'user') return;

    const books = getBooksFromStorage().filter(book =>
        book.status === 'Available' && book.visible
    );
    const tableBody = document.getElementById('availableBooksBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>
                <button class="action-btn checkout-btn" onclick="checkoutBook(${book.id})">Check Out</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadCheckedOutBooks() {
    if (currentUser?.role !== 'librarian') return;

    const books = getBooksFromStorage().filter(book => book.status === 'Checked Out');
    const container = document.getElementById('checkedOutBooks');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Checked Out By</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="checkedOutBooksBody"></tbody>
        </table>
    `;

    const tableBody = document.getElementById('checkedOutBooksBody');
    books.forEach(book => {
        const row = document.createElement('tr');
        const dueDate = new Date(book.dueDate);
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.checkedOutBy}</td>
            <td>${dueDate.toLocaleDateString()}</td>
            <td>
                <button class="action-btn checkin-btn" onclick="checkinBook(${book.id})">Check In</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadUserCheckedOutBooks() {
    if (currentUser?.role !== 'user') return;

    const books = getBooksFromStorage().filter(book =>
        book.status === 'Checked Out' && book.checkedOutBy === currentUser.email
    );
    const tableBody = document.getElementById('yourBooksBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        const dueDate = new Date(book.dueDate);
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${dueDate.toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="checkinBook(${book.id})">Check In</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadBookRequests() {
    if (currentUser?.role !== 'librarian') return;

    const requests = getRequestsFromStorage();
    const tableBody = document.getElementById('bookRequestsBody');
    tableBody.innerHTML = '';

    requests.forEach(request => {
        const row = document.createElement('tr');
        const requestDate = new Date(request.date);
        row.innerHTML = `
            <td>${request.title}</td>
            <td>${request.author}</td>
            <td>${request.requestedBy}</td>
            <td>${requestDate.toLocaleDateString()}</td>
            <td>${request.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Event Listeners

document.addEventListener('DOMContentLoaded', () => {
    initializeBooks();

    // Add book form
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'addBookForm') {
            e.preventDefault();
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const isbn = document.getElementById('bookISBN').value;

            if (title && author && isbn) {
                addBook(title, author, isbn);
                e.target.reset();
            }
        }

        if (e.target && e.target.id === 'requestBookForm') {
            e.preventDefault();
            const title = document.getElementById('requestTitle').value;
            const author = document.getElementById('requestAuthor').value;

            if (title && author) {
                requestBook(title, author);
                e.target.reset();
                alert('Book request submitted successfully!');
            }
        }
    });

    // Search functionality
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'searchBtn') {
            searchBooks();
        }
    });
});

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const books = getBooksFromStorage().filter(book =>
            book.visible && book.status === 'Available' && (
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm)
            )
    );

    const tableBody = document.getElementById('availableBooksBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>
                <button class="action-btn checkout-btn" onclick="checkoutBook(${book.id})">Check Out</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}