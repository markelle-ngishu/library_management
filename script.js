// ========================
// Database Simulation
// ========================

// Initialize books in localStorage if not exists
function initializeBooks() {
    if (!localStorage.getItem('libraryBooks')) {
        const defaultBooks = [
            { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'Available', visible: true },
            { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'Available', visible: true }
        ];
        localStorage.setItem('libraryBooks', JSON.stringify(defaultBooks));
    }
}

// Get all books from storage
function getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('libraryBooks')) || [];
}

// Save books to storage
function saveBooksToStorage(books) {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// ========================
// Book Management Functions
// ========================

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
}

function removeBook(id) {
    const books = getBooksFromStorage();
    const updatedBooks = books.filter(book => book.id !== id);
    saveBooksToStorage(updatedBooks);
    loadBooks();
}

function checkoutBook(bookId, userId) {
    const books = getBooksFromStorage();
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        books[bookIndex].status = 'Checked Out';
        books[bookIndex].checkedOutBy = userId;
        // Set due date to 2 weeks from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        books[bookIndex].dueDate = dueDate.toISOString();
        saveBooksToStorage(books);
        loadBooks();
        loadCheckedOutBooks();
        loadAvailableBooks();
    }
}

function checkinBook(bookId) {
    const books = getBooksFromStorage();
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        books[bookIndex].status = 'Available';
        books[bookIndex].checkedOutBy = null;
        books[bookIndex].dueDate = null;
        // Set visibility based on your requirements
        books[bookIndex].visible = false; // Or true if you want it to remain visible
        saveBooksToStorage(books);
        loadBooks();
        loadCheckedOutBooks();
        loadAvailableBooks();
    }
}

// ========================
// UI Rendering Functions
// ========================

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
            `<button onclick="checkoutBook(${book.id}, ${currentUser.id})">Check Out</button>` :
            `<button onclick="checkinBook(${book.id})">Check In</button>`}
                <button onclick="removeBook(${book.id})">Remove</button>
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
                <button onclick="checkoutBook(${book.id}, ${currentUser.id})">Check Out</button>
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
            <td>User #${book.checkedOutBy}</td>
            <td>${dueDate.toLocaleDateString()}</td>
            <td>
                <button onclick="checkinBook(${book.id})">Check In</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadUserCheckedOutBooks() {
    if (currentUser?.role !== 'user') return;

    const books = getBooksFromStorage().filter(book =>
        book.status === 'Checked Out' && book.checkedOutBy === currentUser.id
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
                <button onclick="requestExtension(${book.id})">Request Extension</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ========================
// Event Listeners
// ========================

document.addEventListener('DOMContentLoaded', () => {
    initializeBooks();

    // Add book form
    document.getElementById('addBookForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const isbn = document.getElementById('bookISBN').value;

        if (title && author && isbn) {
            addBook(title, author, isbn);
            this.reset();
        }
    });

    // Search functionality
    document.getElementById('searchBtn')?.addEventListener('click', searchBooks);

    // Request book form
    document.getElementById('requestBookForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('requestTitle').value;
        const author = document.getElementById('requestAuthor').value;

        if (title && author) {
            alert(`Request submitted for: ${title} by ${author}`);
            this.reset();
        }
    });
});

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const books = getBooksFromStorage().filter(book =>
            book.visible && (
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
                <button onclick="checkoutBook(${book.id}, ${currentUser.id})">Check Out</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function requestExtension(bookId) {
    const books = getBooksFromStorage();
    const book = books.find(b => b.id === bookId);

    if (book) {
        const newDueDate = new Date(book.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);
        book.dueDate = newDueDate.toISOString();
        saveBooksToStorage(books);
        loadUserCheckedOutBooks();
        alert('Extension granted! New due date: ' + newDueDate.toLocaleDateString());
    }
}