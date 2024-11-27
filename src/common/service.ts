import { store } from '@/common/store';
import { FormField } from "@/common/interfaces";
import { Vue } from "vue-property-decorator";

class Service {
  formControlsSave(formId: string) {
    return [...store.forms.controls]
      .filter(c => c.parentID === formId && c.control === 'TEXT');
    // Или другая логика для тех полей, что нужно сохранять
  }

  forms() {
    return [...store.forms.controls].filter(f => f.control === 'FORM');
  }

  getFromLocalStorage() {
    const forms = this.forms();
    forms.forEach((form) => {
      const savedControls = localStorage.getItem(form.id);
      if (savedControls) {
        try {
          const saved = JSON.parse(savedControls) as FormField[];
          this.formControlsSave(form.id).forEach(c => {
            const savedControl = saved.find(sc => sc.id === c.id)
            Vue.set(c, "value", savedControl?.value)
          });
        } catch (error) {
          console.error("Ошибка парсинга данных из LocalStorage:", error);
        }
      }
    })
  }

  saveToLocalStorage(formId: string) {
    try {
      localStorage.setItem(formId, JSON.stringify(this.formControlsSave(formId)));
    } catch (error) {
      console.error("Ошибка сохранения данных в LocalStorage:", error);
    }
  }

  async loadForms(apiUrl: string) {
    await fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Ошибка загрузки JSON");
        }
        return response.json();
      })
      .then(data => {
        store.forms = data;
        this.getFromLocalStorage();
      })
      .catch(error => {
        console.error("Ошибка:", error);
      });
  }

  async submitForm(formId: string) {
    store.isSubmitting[formId] = true;
    store.submissionStatus[formId] = { success: undefined };

    const formData = store.forms.controls
      .filter(form => form.parentID === formId || form.id === formId);
    // Или другая логика подбора полей формы для отправки

    try {
      // Комментируем реальное сохранение
      // const response = await fetch(store.forms.submitUrl, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });
      //
      // if (!response.ok) {
      //   throw new Error("Ошибка при отправке данных на сервер.");
      // }
      console.log(`Форма ${formId} успешно отправлена:`);
      console.log(JSON.stringify(formData));
      // console.log(`Форма ${formId} успешно отправлена:`, await response.json()); // При реальном fetch
      store.submissionStatus[formId] = { success: true };
      this.saveToLocalStorage(formId);
    } catch (error) {
      const typedError = error as Error;
      store.submissionStatus[formId] = { success: false, error: typedError.message };
      console.error("Ошибка:", error);
    } finally {
      store.isSubmitting[formId] = false;
    }
  }
}

const service = new Service();

export default service;
