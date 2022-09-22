// Variables

// DOM-elements
let carousel = document.querySelector("#carousel-body-one");
let line = carousel.querySelector("#carousel__line");
let images = carousel.querySelector("#carousel__line").children;

// program vars
let clickAllow = true;     // статус сдвига изображения
let imageNumber = 1;


// ? Обоработка НАВЕДЕНИЯ/ОТВЕДЕНИЯ КУРСОРА на карусель (задание тени)

// Задание data-атрибута с порядковым номером для изображений
Array.from(images).forEach((image, index) => {
   image.dataset.imageNumber = index + 1;
});


// Включение тени
carousel.addEventListener("mouseover", function (ev) {
   let target = ev.target;

   if (target.closest("#carousel__line") || target.closest("[data-direction]") || target.closest("#carousel__indicator")) {
      line.style.opacity = 0.7;
   }
});


// Сброс тени
carousel.addEventListener("mouseout", function (ev) {
   line.style.opacity = 1;
});


// ? Обработка клика по КАРУСЕЛИ

// Обработчик кликов по карусели
carousel.addEventListener("click", function (ev) {

   imageNumber = Math.round((Math.abs(line.offsetLeft) / line.offsetWidth) + 1)

   let target = ev.target;

   if (!clickAllow) return;      // предотвращение обрыва анимации

   // при клике по стрелкам :
   if (target.closest("[data-direction]")) {

      let arrow = target.closest("[data-direction]");

      arrowClickHandler.call(this, arrow.getAttribute("data-direction"));

      clickAllow = false;
   }

   //                                              !
   if (target.closest("[data-indicator-number]")) {
      let indicatorItem = target.closest("[data-indicator-number]");

      indicatorClickHandler.call(this, indicatorItem);
   }

   line.addEventListener("transitionend", arrowTransitionHandler);

});


// ? Обработка клика по ИНДИКАТОРУ

//                                              !
// Обработчик кликов по индикатору
function indicatorClickHandler(indicatorItem, arrowDirectionNUmber) {

   let activeIndicator = carousel.querySelector(".active");
   let lastIndicatorNumber = activeIndicator.getAttribute("data-indicator-number")
   let indicatorNumber = (indicatorItem) ? indicatorItem.getAttribute("data-indicator-number")
                                       : arrowDirectionNUmber;
   let nextImageNumber = imageNumber + (+indicatorNumber - +lastIndicatorNumber);
   let nextImageLeft;

   if (indicatorNumber == lastIndicatorNumber) return;
   clickAllow = false;

   if ((1 <= imageNumber && imageNumber < 4)
      && (lastIndicatorNumber == imageNumber)) {

      nextImageLeft = (indicatorNumber - 1) * (line.offsetWidth);

      shiftImage(nextImageLeft, indicatorNumber);

      if (indicatorNumber == 4) {
         setTimeout(indicatorTransitionHandler, 200, "right");
      }

   }

   if ((4 <= imageNumber && imageNumber <= 6)
      || (imageNumber <= 4 && lastIndicatorNumber != imageNumber)) {

      nextImageLeft = ((imageNumber + (indicatorNumber - lastIndicatorNumber)) - 1) * (line.offsetWidth);
      shiftImage(nextImageLeft, indicatorNumber);

      if (indicatorNumber - lastIndicatorNumber > 0) {
         if (nextImageNumber != 6) {
            setTimeout(indicatorTransitionHandler, 200, "right");
         }
      }

      if (indicatorNumber - lastIndicatorNumber < 0) {
         if (!(imageNumber == 6 && indicatorNumber == 3)) {
            setTimeout(indicatorTransitionHandler, 200, "left");
         }
      }

   }
}


function shiftImage(nextImageLeft, indicatorNumber) {
   line.style.left = `${-nextImageLeft}px`;
   nextImageNumber = (nextImageLeft / line.offsetWidth) + 1;

   carousel.querySelector(".active").classList.remove("active");
   carousel.querySelector(`[data-indicator-number="${indicatorNumber}"]`).classList.add("active");

   return nextImageNumber;
}


function indicatorTransitionHandler(direction) {
   let activeNumber;

   carousel.querySelector(".active").classList.remove("active");

   if (direction == "right") {
      activeNumber = 2
   } else if (direction == "left") {
      activeNumber = 1
   }

   carousel.querySelectorAll("[data-indicator-number]")[activeNumber].classList.add("active");
}


// ? Обработка клика по СТРЕЛКАМ

// Разрешение кликов по стрелкам по завершении анимации
function arrowTransitionHandler(ev) {
   if (ev.propertyName == "transform" || ev.propertyName == "left") {

      clickAllow = true;

      line.removeEventListener("transitionend", arrowTransitionHandler);
   };
}


function arrowClickHandler(direction) {

   let lineOffsetLeft = getComputedStyle(line).left.split("").slice(0, -2).join("");     // отступ слева элемента line
   let lineOffsetLeftMax = line.offsetWidth * (line.children.length - 1);
   let indicatorNumber = carousel.querySelector(".active").getAttribute("data-indicator-number");

   if (direction == "right") {

      if (lineOffsetLeft != -lineOffsetLeftMax) {
         line.style.left = `${+lineOffsetLeft - +line.offsetWidth}` + "px";

         // Индикаторы
         ++indicatorNumber;
         indicatorClickHandler(false, indicatorNumber);
      }
   }

   if (direction == "left") {

      if (lineOffsetLeft != 0) {
         line.style.left = `${+lineOffsetLeft + +line.offsetWidth}` + "px";

         // Индикаторы
         --indicatorNumber;
         indicatorClickHandler(false, indicatorNumber);
      }
   }

   if ((lineOffsetLeft == 0 && direction == "left")
      || (lineOffsetLeft == -lineOffsetLeftMax && direction == "right")) {

      if (direction == "left") indicatorNumber = 4;
      if (direction == "right") indicatorNumber = 1;

      setActiveStyleIndicator(indicatorNumber);

      fromFirstToLast(lineOffsetLeft);
   }
}


function setActiveStyleIndicator(indicatorNumber) {
   carousel.querySelector(".active").classList.remove("active");
   carousel.querySelector(`[data-indicator-number="${indicatorNumber}"]`).classList.add("active");
}


// переход с первого слайда на последний / с последнего на первый
function fromFirstToLast(lineOffsetLeft) {

   let lineOffsetLeftMax = line.offsetWidth * (line.children.length - 1);
   let lineoffsetLeftNew;
   let leftShift;

   if (lineOffsetLeft == 0) {

      lineoffsetLeftNew = -lineOffsetLeftMax;
      leftShift = -lineOffsetLeftMax + line.offsetWidth;

      Array.from(line.children).slice(1).reverse().forEach(item => {
         line.prepend(item);
      });

   } else if (lineOffsetLeft == -lineOffsetLeftMax) {

      lineoffsetLeftNew = 0;
      leftShift = -line.offsetWidth;

      Array.from(line.children).slice(0, -1).forEach(item => {
         line.append(item);
      });
   }

   line.style.transitionDuration = "0s";
   line.style.left = `${lineoffsetLeftNew}px`;

   setTimeout(() => {
      line.style.transition = "left ease 0.5s, opacity linear 0.2s";
      line.style.left = `${leftShift}px`;
   }, 0);

   line.addEventListener("transitionend", transitionEndHandler)
}


// Возврат на место первого/последнего изображения по окончании анимации
function transitionEndHandler(ev) {

   let lineOffsetleft = +getComputedStyle(this).left.split("").slice(0, -2).join("");
   let lineOffsetLeftMax = this.offsetWidth * (this.children.length - 1);

   if (ev.propertyName == "left") {

      this.style.transitionDuration = "0s";

      if (lineOffsetleft == -this.offsetWidth) {

         this.style.left = `0px`;
         this.append(this.firstElementChild);

      } else if (lineOffsetleft == this.offsetWidth - lineOffsetLeftMax) {

         this.style.left = `-${lineOffsetLeftMax}px`;
         this.prepend(this.lastElementChild);
      }

      setTimeout(() => {
         this.style.transition = "left ease 0.5s, opacity linear 0.2s";
      }, 0);

      this.removeEventListener("transitionend", transitionEndHandler);
   }
}