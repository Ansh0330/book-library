document.addEventListener("DOMContentLoaded", () => {
  gsap.fromTo(
    "h1",
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
  );
  gsap.fromTo(
    ".search-container",
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power2.out" }
  );
  gsap.fromTo(
    ".books-container",
    { opacity: 0 },
    { opacity: 1, duration: 1, delay: 0.6, ease: "power2.out" }
  );
  gsap.fromTo(
    ".pagination-container",
    { opacity: 0 },
    { opacity: 1, duration: 1, delay: 0.8, ease: "power2.out" }
  );

  gsap.utils.toArray(".book-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 1.2 + index * 0.1,
        ease: "power2.out",
      }
    );
  });
});

let books = [];
let currentPage = 1;
const booksPerPage = 9;

async function fetchData() {
  const url =
    "https://api.freeapi.app/api/v1/public/books?page=1&limit=30&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=all";
  const options = { method: "GET", headers: { accept: "application/json" } };

  try {
    const response = await fetch(url, options);
    const booksData = await response.json();
    if (!response.ok) {
      throw new Error("Error fetching the books : ", booksData.message);
    }
    books = booksData.data.data;
    books.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title)); // initial sort
    displayBooks(books);
  } catch (error) {
    console.error(error);
  }
}

function displayBooks(books) {
  // filteredBooks = books;
  const bookContainer = document.getElementById("books-container");
  bookContainer.innerHTML = ""; // Clear previous books

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToDisplay = books.slice(startIndex, endIndex);

  booksToDisplay.forEach((book) => {
    const volumeInfo = book.volumeInfo;

    // Create book card
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    // Create a tag for book image
    const bookImgContainer = document.createElement("a");
    bookImgContainer.href = volumeInfo.infoLink;
    bookImgContainer.target = "_blank";
    bookImgContainer.classList.add("book-img-container");

    const bookImg = document.createElement("img");
    bookImg.src = volumeInfo.imageLinks?.thumbnail || "placeholder.jpg"; // Default if no image
    bookImg.alt = volumeInfo.title;
    bookImgContainer.appendChild(bookImg);

    // Create div for book description
    const bookDesc = document.createElement("div");
    bookDesc.classList.add("book-desc");

    // Add book title
    const title = document.createElement("a");
    title.href = volumeInfo.infoLink;
    title.target = "_blank";
    title.textContent = volumeInfo.title;
    bookDesc.appendChild(title);

    // Add book author
    if (volumeInfo.authors) {
      const authorDisplay = document.createElement("p");
      authorDisplay.textContent = `Author: ${volumeInfo.authors.join(", ")}`;
      bookDesc.appendChild(authorDisplay);
    }

    // Add book publisher
    if (volumeInfo.publisher) {
      const publisherDisplay = document.createElement("p");
      publisherDisplay.textContent = `Publisher: ${volumeInfo.publisher}`;
      bookDesc.appendChild(publisherDisplay);
    }

    // Add published date
    if (volumeInfo.publishedDate) {
      const publishedDateDisplay = document.createElement("p");
      publishedDateDisplay.textContent = `Published Date: ${volumeInfo.publishedDate}`;
      bookDesc.appendChild(publishedDateDisplay);
    }

    // Append everything
    bookCard.appendChild(bookImgContainer);
    bookCard.appendChild(bookDesc);
    bookContainer.appendChild(bookCard);

    updatePaginationButtons(books); // Update Next/Previous button states

    // Add GSAP animation for smooth book fade-in
    gsap.fromTo(
      ".book-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
    );
  });
}

const toggleViewBtn = document.getElementById("toggle-view");

toggleViewBtn.addEventListener("click", function () {
  const booksContainer = document.getElementById("books-container");
  booksContainer.classList.toggle("grid-view");

  // Change button text based on mode
  if (booksContainer.classList.contains("grid-view")) {
    this.textContent = "View as List";
  } else {
    this.textContent = "View as Grid";
  }
});

function filterBooks() {
  const searchInput = document.getElementById("search-input");
  const inputValue = searchInput.value.toLowerCase();

  const filteredBooks = books.filter((book) => {
    const title = book.volumeInfo.title.toLowerCase();
    const authors = book.volumeInfo.authors.join(" ").toLowerCase();
    return title.includes(inputValue) || authors.includes(inputValue);
  });
  displayBooks(filteredBooks);
}

// Implement the sorting function
const sortInput = document.getElementById("sort-select");
sortInput.addEventListener("change", function () {
  const sortType = sortInput.value;

  if (sortType === "title-asc") {
    books.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
  } else if (sortType === "title-desc") {
    books.sort((a, b) => b.volumeInfo.title.localeCompare(a.volumeInfo.title));
  } else if (sortType === "date-asc") {
    books.sort(
      (a, b) =>
        new Date(a.volumeInfo.publishedDate) -
        new Date(b.volumeInfo.publishedDate)
    );
  } else if (sortType === "date-desc") {
    books.sort(
      (a, b) =>
        new Date(b.volumeInfo.publishedDate) -
        new Date(a.volumeInfo.publishedDate)
    );
  }

  displayBooks(books); // Refresh the book list after sorting
});

// implement pagination
function updatePaginationButtons(books) {
  const pageNumber = document.querySelector("#page-info");
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * booksPerPage >= books.length;
  pageNumber.textContent = `Page ${currentPage}`;
}

const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");

prevBtn.addEventListener("click", function () {
  if (currentPage > 1) {
      currentPage--;
      displayBooks(books);
  }
});

nextBtn.addEventListener("click", function () {
  const totalPages = Math.ceil(books.length / booksPerPage);
  if (currentPage < totalPages) {
      currentPage++;
      displayBooks(books);
  }
});

fetchData();
