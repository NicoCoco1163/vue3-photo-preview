import { App, h, createVNode, render, nextTick, watch } from 'vue';
import PhotoProvider from './PhotoProvider/index.vue';
import PhotoConsumer from './PhotoConsumer/index.vue';
import PhotoSlider from './PhotoSlider/index.vue';
import PhotoThumbnail from './PhotoThumbnail/index.vue';
import { PhotoProviderProps } from './types';

const components = [
  PhotoProvider,
  PhotoConsumer,
  PhotoSlider,
  PhotoThumbnail
];

const install = (app: App): void  => {
  components.forEach(component => {
    app.component(component.name, component);
  });

  app.config.globalProperties.$photoPreview = (
    items = [],
    index = 0,
    props: PhotoProviderProps
  ) => {
    if (
      !Array.isArray(items) ||
      !items.length
    ) return;

    const el = document.createElement('div');
    const vm = createVNode(PhotoProvider, props, {
      default: () => {
        return items.map(imgProps => {
          return h(PhotoConsumer, typeof imgProps === 'string'
            ? { src: imgProps, key: imgProps }
            : imgProps
          );
        });
      }
    });

    vm.appContext = app._context;
    document.body.appendChild(el);
    render(vm, el);

    const proxyValue = vm?.component?.proxy as any;

    if (proxyValue?.visible !== undefined) {
      const unwatch = watch(
        () => proxyValue.visible,
        visible => {
          if (visible === false) {
            unwatch?.();
            vm?.el && render(null, vm.el as HTMLElement); // unmount
            document.body.removeChild(el);
          }
        }, { deep: true }
      );
    }
    nextTick(() => {
      if (typeof proxyValue?.updateIndex === 'function') {
        proxyValue.updateIndex(index);
      }
      if (proxyValue?.visible !== undefined) {
        proxyValue.visible = true;
      }
    });
  };
};

export * from './types';

export { PhotoProvider, PhotoConsumer, PhotoSlider, PhotoThumbnail };

export default { install };
