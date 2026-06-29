import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PasswordField from '@/components/PasswordField.vue';

describe('PasswordField', () => {
  it('toggles visibility and accessible label', async () => {
    const wrapper = mount(PasswordField, { props: { modelValue: 'secret', label: 'Senha' } });
    expect(wrapper.get('input').attributes('type')).toBe('password');
    await wrapper.get('button[aria-label="Mostrar senha"]').trigger('click');
    expect(wrapper.get('input').attributes('type')).toBe('text');
    expect(wrapper.get('button').attributes('aria-label')).toBe('Ocultar senha');
  });
});
