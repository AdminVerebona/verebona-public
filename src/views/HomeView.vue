<template>
  <main>
    <!-- Ordre des sections — charte 2026 §6 : Hero · Bénéfices · Application ·
         Comment ça marche · Cas d'usage · Fonctionnalités · Tarifs · Confiance ·
         FAQ · CTA final (pied de page dans App.vue). -->
    <HeroSection />
    <BenefitsSection />
    <AppShowcaseSection />
    <HowItWorksSection />
    <UseCasesSection />
    <FeaturesSection />
    <PricingSection />
    <TrustSection />
    <FaqSection />
    <CtaSection />
    <MobileFixedCta />
  </main>
</template>

<script setup lang="ts">
import HeroSection from '../sections/HeroSection.vue'
import BenefitsSection from '../sections/BenefitsSection.vue'
import AppShowcaseSection from '../sections/AppShowcaseSection.vue'
import UseCasesSection from '../sections/UseCasesSection.vue'
import FeaturesSection from '../sections/FeaturesSection.vue'
import HowItWorksSection from '../sections/HowItWorksSection.vue'
import PricingSection from '../sections/PricingSection.vue'
import TrustSection from '../sections/TrustSection.vue'
import FaqSection from '../sections/FaqSection.vue'
import CtaSection from '../sections/CtaSection.vue'
import MobileFixedCta from '../components/MobileFixedCta.vue'
</script>
