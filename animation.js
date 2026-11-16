const catImage = document.getElementById("cat-image");
const coffeeImage = document.getElementById("coffee-image");
const moonImage = document.getElementById("moon-image");

let coffeeFrame = 1;

function animateCoffee() {
    coffeeFrame = coffeeFrame === 1 ? 2 : 1;
    coffeeImage.src = `coffee${coffeeFrame}.png`;
    setTimeout(animateCoffee, 700);
}

let catFrame = 1;

function animateCat() {
    catFrame = catFrame === 1 ? 2 : 1;
    catImage.src = `cat${catFrame}.png`;
    setTimeout(animateCat, catFrame === 1 ? 3000 : 150); 
}

let moonFrame = 1;

function animateMoon() {
    moonFrame = moonFrame === 1 ? 2 : 1;
    moonImage.src = `moon${moonFrame}.png`;
    setTimeout(animateMoon, 500);
}

animateCoffee();
animateCat();
animateMoon();