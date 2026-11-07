// ----- Parts of the page we need -----
const form = document.getElementById("id-form");
const nameInput = document.getElementById("name");
const schoolInput = document.getElementById("school");
const courseInput = document.getElementById("course");
const errorBox = document.getElementById("error");

const card = document.getElementById("card");
const placeholder = document.getElementById("placeholder");
const cardInner = document.getElementById("card-inner");
const faceFront = document.getElementById("face-front");
const faceBack = document.getElementById("face-back");
const showFront = document.getElementById("show-front");
const showBack = document.getElementById("show-back");

const cardName = document.getElementById("card-name");
const cardSchool = document.getElementById("card-school");
const cardCourse = document.getElementById("card-course");
const cardInitials = document.getElementById("card-initials");
const cardIdnum = document.getElementById("card-idnum");
const backIdnum = document.getElementById("back-idnum");
const cardDate = document.getElementById("card-date");
const qrBox = document.getElementById("qr");

// ----- Small helper functions -----

// Makes the same ID number for the same details (so it does not change by chance)
function makeIdNumber(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 900000;
  }
  return "MID-" + (hash + 100000);
}

// "Musa Ibrahim" -> "MI"
function getInitials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  let letters = words[0].charAt(0);
  if (words.length > 1) {
    letters += words[words.length - 1].charAt(0);
  }
  return letters.toUpperCase();
}

// Draws the QR code as an SVG inside the white tile
function drawQR(text) {
  let qr = null;

  // try bigger QR sizes until the text fits
  for (let size = 3; size <= 14; size++) {
    try {
      const attempt = new QRCode(size, 0);
      attempt.addData(text);
      attempt.make();
      qr = attempt;
      break;
    } catch (e) {
      // too small, try the next size
    }
  }

  if (qr === null) {
    qrBox.textContent = "";
    return;
  }

  const count = qr.getModuleCount();
  let path = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        path += "M" + col + " " + row + "h1v1h-1z";
      }
    }
  }

  qrBox.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + count + " " + count +
    '" shape-rendering="crispEdges"><path d="' + path + '" fill="#0d2447"/></svg>';
}

// Turns the card over (true = back, false = front)
function setSide(showBackSide) {
  cardInner.classList.toggle("flipped", showBackSide);

  showFront.classList.toggle("active", !showBackSide);
  showBack.classList.toggle("active", showBackSide);
  showFront.setAttribute("aria-pressed", String(!showBackSide));
  showBack.setAttribute("aria-pressed", String(showBackSide));

  faceFront.setAttribute("aria-hidden", String(showBackSide));
  faceBack.setAttribute("aria-hidden", String(!showBackSide));
}

// ----- Submit -----
form.addEventListener("submit", function (event) {
  // stop the page from reloading
  event.preventDefault();

  // trim() removes spaces, so "   " counts as empty
  const name = nameInput.value.trim();
  const school = schoolInput.value.trim();
  const course = courseInput.value.trim();

  // reset the red borders, then mark the empty fields
  nameInput.classList.remove("invalid");
  schoolInput.classList.remove("invalid");
  courseInput.classList.remove("invalid");

  const missing = [];
  if (name === "") { missing.push("name"); nameInput.classList.add("invalid"); }
  if (school === "") { missing.push("school"); schoolInput.classList.add("invalid"); }
  if (course === "") { missing.push("course"); courseInput.classList.add("invalid"); }

  if (missing.length > 0) {
    // show the error, keep the card hidden
    errorBox.textContent = "Please enter your " + missing.join(", ") + ".";
    card.classList.add("hidden");
    placeholder.classList.remove("hidden");
    return;
  }

  // all fields are filled in: clear the error and build the card
  errorBox.textContent = "";

  const idNumber = makeIdNumber(name + "|" + school + "|" + course);
  const issued = new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  cardName.textContent = name;
  cardSchool.textContent = school;
  cardCourse.textContent = course;
  cardInitials.textContent = getInitials(name);
  cardIdnum.textContent = idNumber;
  backIdnum.textContent = idNumber;
  cardDate.textContent = issued;

  drawQR("MUSAB ID | " + idNumber + " | " + name + " | " + school + " | " + course);

  setSide(false);
  placeholder.classList.add("hidden");
  card.classList.remove("hidden");

  // on a phone the card is below the form, so bring it into view
  if (window.innerWidth <= 860) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

// ----- Flip controls -----
showFront.addEventListener("click", function () { setSide(false); });
showBack.addEventListener("click", function () { setSide(true); });

// tapping the card itself also turns it
cardInner.addEventListener("click", function () {
  setSide(!cardInner.classList.contains("flipped"));
});
