document.addEventListener("DOMContentLoaded", function () {
	// Obsługa odświeżania obrazka
	var refreshImage = document.getElementById("refresh-image");
	refreshImage.addEventListener("click", function () {
		location.reload();
	});

	// Wyświetlenie dynamicznego tekstu
	var dynamicText = document.getElementById("dynamic-text");
	dynamicText.classList.remove("hidden");

	// Implementacja przesuwania obrazków dotykiem
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
			const walk = (x - startX) * 2; // prędkość przesuwania
			image.scrollLeft = scrollLeft - walk;
		});
	});

	// Konfiguracja i18next i obsługa zmiany języka
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

	function updateTexts() {
		document.querySelectorAll("[data-i18n]").forEach((element) => {
			const key = element.getAttribute("data-i18n");
			element.textContent = i18next.t(key);
		});
	}

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

	$("#menu-navigation a").on("click", function (e) {
		e.preventDefault();
		var category = $(this).data("category");
		$(".product").hide();
		$("." + category).fadeIn();
		$("#welcome-image").hide();
	});
});
