<template>
  <div v-if="store.forms.controls" class="forms-grid">
    <form
        v-for="form in sortedForms()"
        :key="form.id"
        class="form"
    >
      <h2>{{ form.caption }}</h2>
      <div
          v-for="field in sortedFields(form.id)"
          :key="field.position"
          class="form-group"
      >
        <div v-if="field.control === 'TEXT'" class="input-wrapper">
          <label v-if="findLabel(field.id)">{{ findLabel(field.id) }}</label>
          <input
              v-model="field.value"
              :class="{ 'is-invalid': errors[form.id]?.[field.id] }"
              :tabindex="computeTabindex(form.tabIndex, field.tabIndex)"
              :required="field.required"
          />
          <small
              v-if="errors[form.id]?.[field.id]"
              class="text-danger"
          >
            {{ errors[form.id][field.id] }}
          </small>
        </div>

        <button
            v-else-if="field.control === 'BUTTON'"
            type="button"
            @click="field.caption === 'OK' ? validateForm(form.id) : resetForm(form.id)"
            class="btn"
            :class="field.caption === 'OK' ? 'btn-primary' : 'btn-secondary'"
            :tabindex="computeTabindex(form.tabIndex, field.tabIndex)"
            :disabled="isSubmitting(form.id)"
        >
          {{ field.caption }}
        </button>
      </div>

      <div v-if="store.submissionStatus[form.id]" class="status">
        <p v-if="store.submissionStatus[form.id].success" class="text-success">Форма успешно отправлена!</p>
        <p v-if="JSON.stringify(store.submissionStatus[form.id]) !== '{}' && !store.submissionStatus[form.id].success"
           class="text-danger">
          Ошибка при отправке формы: {{ store.submissionStatus[form.id].error }}
        </p>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { store } from '@/common/store';
import service from '@/common/service';
import { FormField } from '@/common/interfaces';

@Component
export default class DataPage extends Vue {
  store = store;
  errors: { [formId: string]: { [fieldId: string]: string } } = {};

  async created() {
    await service.loadForms("/data2.json");
  }

  sortedForms() {
    return [...store.forms.controls]
        .filter(f => f.control === 'FORM')
        .sort((a, b) => a.position - b.position);
  }

  sortedFields(formId: string) {
    return [...store.forms.controls]
        .filter(control => control.parentID === formId)
        .sort((a, b) => a.position - b.position);
  }

  computeTabindex(formTabIndex: number, fieldTabIndex: number) {
    if (formTabIndex === 0) {
      return fieldTabIndex;
    } else {
      return formTabIndex * 100 + fieldTabIndex;
    }
  }

  validateForm(formId: string) {
    this.$set(this.errors, formId, {});

    const formFields: FormField[] = this.sortedFields(formId);
    if (formFields.length > 0) {
      formFields.forEach((field) => {
        if (field.required && !field.value?.trim()) {
          this.$set(this.errors[formId], field.id, "Это поле обязательно для заполнения.");
        }
      });
    }

    if (Object.keys(this.errors[formId]).length === 0) {
      this.submitForm(formId);
    }
  }

  async submitForm(formId: string) {
    await service.submitForm(formId);
  }

  resetForm(formId: string) {
    const formControls = this.sortedFields(formId).filter(f => f.control === 'TEXT');
    formControls.forEach((field) => {
      field.value = '';
    })
    if (localStorage.getItem(formId)) {
      localStorage.removeItem(formId);
    }
    store.submissionStatus[formId] = {};
  }

  findLabel(id: string): string {
    const label = store.forms.controls.find(f => f.control === 'LABEL' && f.parentID === id);
    return label ? label.caption : '';
  }

  isSubmitting(formId: string): boolean {
    return store.isSubmitting[formId] || false;
  }
}
</script>
