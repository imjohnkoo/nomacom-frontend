import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface FormFieldContext {
  id: string
  name?: string
  error?: Ref<string | undefined>
  disabled?: Ref<boolean>
  required?: Ref<boolean>
}

export const FORM_FIELD_KEY: InjectionKey<FormFieldContext> = Symbol('NFormField')

/** Provide form field context (used by NFormField) */
export function provideFormField(ctx: FormFieldContext) {
  provide(FORM_FIELD_KEY, ctx)
}

/** Inject form field context (used by form inputs) */
export function useFormField(): FormFieldContext | undefined {
  return inject(FORM_FIELD_KEY, undefined)
}

export interface FormContext {
  disabled: Ref<boolean>
}

export const FORM_KEY: InjectionKey<FormContext> = Symbol('NForm')

/** Provide form context (used by NForm) */
export function provideForm(ctx: FormContext) {
  provide(FORM_KEY, ctx)
}

/** Inject form context */
export function useForm(): FormContext | undefined {
  return inject(FORM_KEY, undefined)
}
