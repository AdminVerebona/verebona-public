<template>
  <header
    id="vb-header"
    style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: transparent;
      border-bottom: 1px solid transparent;
      transition:
        background 0.3s ease,
        border-color 0.3s ease,
        backdrop-filter 0.3s ease;
    "
  >
    <div
      style="
        max-width: 1280px;
        margin: 0 auto;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      "
    >
      <a
        href="#top"
        @click.prevent="goHome"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          cursor: pointer;
        "
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          style="overflow: visible"
        >
          <rect x="0" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff" />
          <rect
            x="11.43"
            y="0"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="0"
            y="11.43"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="11.43"
            y="11.43"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="22.86"
            y="11.43"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="0"
            y="22.86"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="11.43"
            y="22.86"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="22.86"
            y="22.86"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#fff"
          />
          <rect
            x="22.86"
            y="-1.55"
            width="9.14"
            height="9.14"
            rx="1.6"
            fill="#2F6BFF"
            transform="rotate(18 27.43 3.02)"
          />
        </svg>
        <span
          style="
            font-family: &quot;Bricolage Grotesque&quot;, sans-serif;
            font-weight: 700;
            font-size: 19px;
            letter-spacing: -0.01em;
            color: #fff;
          "
          >Verebona</span
        >
      </a>
      <nav
        class="r-nav"
        style="
          display: flex;
          align-items: center;
          gap: 32px;
          font-size: 16px;
          color: #9ba6bc;
          font-weight: 500;
        "
      >
        <a
          href="#how"
          @click.prevent="navHow"
          style="cursor: pointer; transition: color 0.15s"
          v-hover="{ color: '#fff' }"
          >Comment ça marche</a
        >
        <a
          href="#cas-usage"
          @click.prevent="navCasUsage"
          style="cursor: pointer; transition: color 0.15s"
          v-hover="{ color: '#fff' }"
          >Cas d'usage</a
        >
        <a
          href="#pricing"
          @click.prevent="navPricing"
          style="cursor: pointer; transition: color 0.15s"
          v-hover="{ color: '#fff' }"
          >Tarifs</a
        >
        <a
          href="#faq"
          @click.prevent="navFaq"
          style="cursor: pointer; transition: color 0.15s"
          v-hover="{ color: '#fff' }"
          >FAQ</a
        >
      </nav>
      <div
        style="display: flex; align-items: center; gap: 12px; flex-shrink: 0"
      >
        <a
          :href="loginUrl()"
          class="r-hide-m"
          style="
            font-size: 15.5px;
            font-weight: 600;
            color: #c7d0e0;
            padding: 10px 19px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 999px;
            transition: all 0.15s;
          "
          v-hover="{ borderColor: 'rgba(148,163,184,.5)', color: '#fff' }"
          >Se connecter</a
        >
        <a
          :href="signupUrl()"
          class="r-hide-m"
          style="
            font-size: 15.5px;
            font-weight: 600;
            color: #fff;
            padding: 11px 21px;
            border-radius: 999px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            box-shadow: 0 8px 22px rgba(37, 99, 235, 0.4);
            transition: transform 0.15s;
          "
          v-hover="{ transform: 'translateY(-1px)' }"
          >Essayer gratuitement</a
        >
        <button
          type="button"
          class="r-burger"
          @click.prevent="toggleMenu"
          aria-label="Menu"
          style="
            width: 44px;
            height: 44px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            background: rgba(15, 23, 42, 0.55);
            cursor: pointer;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 4px;
            flex-shrink: 0;
          "
        >
          <span :style="burgerTop"></span>
          <span :style="burgerMid"></span>
          <span :style="burgerBot"></span>
        </button>
      </div>
    </div>
    <template v-if="menuOpen">
      <div
        class="r-mobile-menu"
        style="
          flex-direction: column;
          gap: 2px;
          padding: 8px 20px 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(7, 14, 32, 0.98);
          backdrop-filter: blur(14px);
        "
      >
        <a
          href="#how"
          @click.prevent="navHow"
          style="
            padding: 14px 6px;
            font-size: 16px;
            font-weight: 600;
            color: #c7d0e0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          "
          >Comment ça marche</a
        >
        <a
          href="#cas-usage"
          @click.prevent="navCasUsage"
          style="
            padding: 14px 6px;
            font-size: 16px;
            font-weight: 600;
            color: #c7d0e0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          "
          >Cas d'usage</a
        >
        <a
          href="#pricing"
          @click.prevent="navPricing"
          style="
            padding: 14px 6px;
            font-size: 16px;
            font-weight: 600;
            color: #c7d0e0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          "
          >Tarifs</a
        >
        <a
          href="#faq"
          @click.prevent="navFaq"
          style="
            padding: 14px 6px;
            font-size: 16px;
            font-weight: 600;
            color: #c7d0e0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          "
          >FAQ</a
        >
        <div style="display: flex; gap: 10px; margin-top: 16px">
          <a
            :href="loginUrl()"
            @click="closeMenu"
            style="
              flex: 1;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 13px 10px;
              line-height: 1.2;
              border: 1px solid rgba(148, 163, 184, 0.28);
              border-radius: 999px;
              font-size: 15px;
              font-weight: 600;
              color: #fff;
            "
            >Se connecter</a
          >
          <a
            :href="signupUrl()"
            @click="closeMenu"
            style="
              flex: 1;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 13px 10px;
              line-height: 1.2;
              border-radius: 999px;
              font-size: 15px;
              font-weight: 600;
              color: #fff;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            "
            >Essayer gratuitement</a
          >
        </div>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useNav } from "../composables/useNav";
import { loginUrl, signupUrl } from "../config/urls";

const {
  menuOpen,
  toggleMenu,
  closeMenu,
  goHome,
  navHow,
  navCasUsage,
  navPricing,
  navFaq,
  burgerTop,
  burgerMid,
  burgerBot,
} = useNav();

// Header goes from transparent (at the very top) to a blurred solid bar as
// soon as the page is scrolled — ported from the prototype.
let onScroll: (() => void) | null = null;
onMounted(() => {
  const header = document.getElementById("vb-header");
  onScroll = () => {
    if (!header) return;
    const s = window.scrollY > 6;
    header.style.background = s ? "rgba(7,14,32,.9)" : "transparent";
    header.style.backdropFilter = s ? "blur(16px)" : "none";
    (header.style as any).webkitBackdropFilter = s ? "blur(16px)" : "none";
    header.style.borderBottomColor = s
      ? "rgba(148,163,184,.14)"
      : "transparent";
    header.style.boxShadow = s ? "0 8px 30px rgba(4,10,26,.35)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => {
  if (onScroll) window.removeEventListener("scroll", onScroll);
});
</script>
