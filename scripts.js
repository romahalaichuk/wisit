document.addEventListener("DOMContentLoaded", function () {
	// Funkcja odświeżania strony
	var refreshImage = document.getElementById("refresh-image");
	refreshImage.addEventListener("click", function () {
		location.reload();
	});

	// Wyświetlanie dynamicznego tekstu
	var dynamicText = document.getElementById("dynamic-text");
	dynamicText.classList.remove("hidden");

	// Obsługa przeciągania obrazów produktów
	const images = document.querySelectorAll(".product img");
	images.forEach((image) => {
		let isDragging = false;
		let startX, scrollLeft;

		image.addEventListener("touchstart", (e) => {
			isDragging = true;
			startX = e.touches[0].pageX - image.offsetLeft;
			scrollLeft = image.scrollLeft;
			image.style.cursor = "grabbing";
		});

		image.addEventListener("touchend", () => {
			isDragging = false;
			image.style.cursor = "grab";
		});

		image.addEventListener("touchmove", (e) => {
			if (!isDragging) return;
			const x = e.touches[0].pageX - image.offsetLeft;
			const walk = (x - startX) * 2;
			image.scrollLeft = scrollLeft - walk;
		});
	});

	// Inicjalizacja i18next i załadowanie plików tłumaczeń
	i18next.init(
		{
			lng: "pl",
			debug: true,
			resources: {
				en: { translation: {} },
				pl: { translation: {} },
				de: { translation: {} },
				es: { translation: {} },
				it: { translation: {} },
				uk: { translation: {} },
				cz: { translation: {} },
				fr: { translation: {} },
				ru: { translation: {} },
			},
		},
		function (err, t) {
			if (err) return console.error("Error initializing i18next:", err);

			const languages = ["en", "pl", "de", "es", "it", "uk", "cz", "fr", "ru"];
			const promises = languages.map((lang) => {
				return fetch(`./locales/${lang}.json`)
					.then((response) => {
						if (!response.ok) {
							throw new Error(`Failed to load translation file for ${lang}`);
						}
						return response.json();
					})
					.then((data) => {
						i18next.addResourceBundle(lang, "translation", data);
					})
					.catch((error) => {
						console.error(
							`Failed to load translation file for ${lang}:`,
							error
						);
					});
			});

			Promise.all(promises).then(() => {
				$("#language-switcher img").click(function () {
					var selectedLang = $(this).data("lang");
					i18next.changeLanguage(selectedLang, function (err, t) {
						if (err) return console.error("Error changing language:", err);
						updateTexts();
					});
				});

				updateTexts();

				const navigationLinks = document.querySelectorAll("#menu-navigation a");
				navigationLinks.forEach((link) => {
					link.addEventListener("click", (event) => {
						event.preventDefault();
						const category = event.target.getAttribute("data-category");
						showProducts(category);
					});
				});
			});
		}
	);

	// Aktualizacja tekstów na stronie
	function updateTexts() {
		document.querySelectorAll("[data-i18n]").forEach((element) => {
			const key = element.getAttribute("data-i18n");
			element.textContent = i18next.t(key);
		});
	}

	// Wyświetlanie produktów na podstawie wybranej kategorii
	function showProducts(category) {
		const products = document.querySelectorAll(".product");
		products.forEach((product) => {
			product.style.display = "none";
		});

		const categoryProducts = document.querySelectorAll(`.product.${category}`);
		categoryProducts.forEach((product) => {
			product.style.display = "block";
		});
	}

	// Przełączanie kategorii produktów
	$("#menu-navigation a").on("click", function (e) {
		e.preventDefault();
		var category = $(this).data("category");
		$(".product").hide();
		$("." + category).fadeIn();
		$("#welcome-image").hide();
	});

	// Karuzela 3D
	const carouselWrapper = document.querySelector(".carousel-wrapper");
	const carouselItems = document.querySelectorAll(".carousel-item");
	let currentIndex = 0;
	const totalItems = carouselItems.length;
	const angle = 360 / totalItems;
	let isDragging = false;
	let startX,
		currentRotate = 0;

	function updateCarousel() {
		carouselWrapper.style.transform = `rotateY(${currentRotate}deg)`;
		carouselItems.forEach((item, index) => {
			const rotation = index * angle;
			item.style.transform = `rotateY(${rotation}deg) translateZ(300px)`;
			item.style.opacity = index === currentIndex ? 1 : 0.6;
		});
	}

	function handleSwipe(diff) {
		currentRotate += diff / 2; // Zwiększona reakcja na ruch palca
		updateCarousel();
	}

	carouselWrapper.addEventListener("touchstart", (e) => {
		isDragging = true;
		startX = e.touches[0].clientX;
	});

	carouselWrapper.addEventListener("touchend", () => {
		isDragging = false;
	});

	carouselWrapper.addEventListener("touchmove", (e) => {
		if (!isDragging) return;
		const diffX = e.touches[0].clientX - startX;
		startX = e.touches[0].clientX;
		handleSwipe(diffX);
	});

	updateCarousel();
});
