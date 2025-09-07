// 메뉴 토글 코드

document.addEventListener('DOMContentLoaded', function () {
  const menuItems = document.querySelectorAll('.nav-2 > li');
  const toggle = document.querySelector('.toggle');
  let activeItem = null;

  menuItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation(); // 버블링 방지

      const isSameItem = item === activeItem;

      // 모든 메뉴 닫기
      menuItems.forEach(el => el.classList.remove('active'));

      // toggle도 닫기
      toggle.classList.remove('active');

      if (!isSameItem) {
        // 현재 메뉴 열기
        item.classList.add('active');
        toggle.classList.add('active');
        activeItem = item;
      } else {
        // 다시 클릭하면 닫힘
        activeItem = null;
      }
    });
  });

  // 문서 아무 곳이나 클릭하면 메뉴 + 토글 닫기
  document.addEventListener('click', function () {
    menuItems.forEach(el => el.classList.remove('active'));
    toggle.classList.remove('active');
    activeItem = null;
  });

  // toggle 안 클릭해도 꺼지지 않게 (선택적)
  toggle.addEventListener('click', e => e.stopPropagation());
});

// 류가현 코드
// $(function () {
//   $('.favorite').click(function () {
//     $(this).find('.favorite-img').toggleClass('on')
//   })
//   $('.local-mall').click(function () {
//     $(this).find('.local-img').toggleClass('on')
//   })
// })

// =============================
// 류가현 코드 + 배지 숫자 + 드로어 + 목록/삭제
// =============================
$(function () {
  // 각 아이템에 고유 id 자동 부여 (p1, p2, ...)
  $('.section4 .inner .item').each(function (i) {
    $(this).attr('data-id', 'p' + (i + 1));
  });

  let cartCount = 0;
  const cartMap = new Map(); // key: id, val: {id, name, price}

  const $badge = $('#cartBadge');
  const $drawer = $('#cartDrawer');
  const $backdrop = $('#cartBackdrop');
  const $cartList = $('#cartList');
  const $cartTotal = $('#cartTotal');

  function parsePrice(text) { return Number(String(text).replace(/[^\d]/g, '')) || 0; }
  function formatPrice(num) { return num.toLocaleString('ko-KR') + '원'; }

  function updateBadge() {
    if (cartCount > 0) {
      $badge.text(cartCount).addClass('show');
    } else {
      $badge.text('0').removeClass('show');
    }
  }

  function renderCart() {
    $cartList.empty();
    if (cartMap.size === 0) {
      $cartList.append('<li class="cart-empty">담긴 상품이 없습니다.</li>');
      $cartTotal.text('0원');
      return;
    }
    let total = 0;
    cartMap.forEach(({ id, name, price }) => {
      total += price;
      $cartList.append(`
        <li class="cart-item" data-id="${id}">
          <div class="cart-item__name">${name}</div>
          <div class="cart-item__price">${formatPrice(price)}</div>
          <button class="cart-item__remove" aria-label="삭제">삭제</button>
        </li>
      `);
    });
    $cartTotal.text(formatPrice(total));
  }

  function openDrawer() {
    renderCart();
    $drawer.addClass('show').attr('aria-hidden', 'false');
    $backdrop.addClass('show');
  }
  function closeDrawer() {
    $drawer.removeClass('show').attr('aria-hidden', 'true');
    $backdrop.removeClass('show');
  }

  // ===== 좋아요 토글 (류가현 코드) =====
  $('.favorite').on('click', function () {
    $(this).find('.favorite-img').toggleClass('on');
    $(this).find('.heart-img').toggleClass('on')
  });

  // ===== 장바구니 토글 + 카운트/목록 동기화 (류가현 코드 확장) =====
  $('.local-mall').on('click', function () {
    const $item = $(this).closest('.item');
    const id = $item.data('id');
    const $img = $(this).find('.local-img');

    const name = $item.find('.text p').text().trim();
    const priceText = $item.find('.text h4').text().trim();
    const price = parsePrice(priceText);

    const isActive = $img.hasClass('on');

    if (isActive) {
      // 제거
      $img.removeClass('on');
      cartMap.delete(id);
      cartCount = Math.max(0, cartCount - 1);
    } else {
      // 추가
      $img.addClass('on');
      cartMap.set(id, { id, name, price });
      cartCount += 1;
    }

    updateBadge();
    if ($drawer.hasClass('show')) renderCart(); // 열려있으면 실시간 반영
  });

  // ===== FAB 클릭 → 드로어 열고 목록 표시 =====
  $('#cartFab').on('click', openDrawer);
  // 닫기
  $('#cartClose').on('click', closeDrawer);
  $('#cartBackdrop').on('click', closeDrawer);

  // ===== 목록에서 개별 삭제 =====
  $cartList.on('click', '.cart-item__remove', function () {
    const $li = $(this).closest('.cart-item');
    const id = $li.data('id');
    if (!id) return;

    // 원래 카드의 아이콘도 off
    const $originItem = $('.section4 .inner .item[data-id="' + id + '"]');
    $originItem.find('.local-img').removeClass('on');

    // 맵/카운트 갱신
    if (cartMap.has(id)) {
      cartMap.delete(id);
      cartCount = Math.max(0, cartCount - 1);
      updateBadge();
    }
    renderCart();
  });

  // (옵션) 구매 버튼 클릭
  $('#cartCheckout').on('click', function () {
    if (cartMap.size === 0) { alert('담긴 상품이 없습니다.'); return; }
    const names = Array.from(cartMap.values()).map(v => v.name).join(', ');
    alert('구매하기: ' + names);
  });

  // 초기
  updateBadge();
});

// 마우스

let lastTime = 0; // 간격 조절용

document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastTime < 50) return; // 0.05초 간격(조절 가능)
  lastTime = now;

  const img = document.createElement("img");
  img.src = "images/cursor.png"; // 잔상 이미지

  // 랜덤 크기 (20~50px)
  const size = Math.floor(Math.random() * 30) + 20;
  img.style.width = size + "px";
  img.style.height = size + "px";

  // 랜덤 투명도 (0.4~1)
  img.style.opacity = (Math.random() * 0.6 + 0.4).toFixed(2);

  img.className = "trail";
  img.style.left = e.pageX + "px";
  img.style.top = e.pageY + "px";

  document.body.appendChild(img);

  // 삭제
  setTimeout(() => img.remove(), 2000);
});


// 헤더-토글
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('langToggle');

  // 열기/닫기
  langToggle.addEventListener('click', (e) => {
    langToggle.classList.toggle('open');
  });
});

