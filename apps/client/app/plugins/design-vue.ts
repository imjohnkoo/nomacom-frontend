import {
  NButton,
  NInput,
  NFormField,
  NSelect,
  NBadge,
  NCard,
  NAlertDialog,
  NConfirmDialog,
  NSeparator,
  NCopyButton,
} from '@imjohnkoo/design-vue';

const components: Record<string, unknown> = {
  NButton,
  NInput,
  NFormField,
  NSelect,
  NBadge,
  NCard,
  NAlertDialog,
  NConfirmDialog,
  NSeparator,
  NCopyButton,
};

export default defineNuxtPlugin((nuxtApp) => {
  for (const [name, component] of Object.entries(components)) {
    nuxtApp.vueApp.component(name, component as Parameters<typeof nuxtApp.vueApp.component>[1]);
  }
});
