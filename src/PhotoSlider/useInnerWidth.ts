import { ref, Ref, onBeforeUnmount } from 'vue';
import throttle from 'lodash-es/throttle';

export default function useInnerWidth(rootElement?: Ref<HTMLElement>): {
  innerWidth: Ref<number>,
  handleResize: () => void,
} {
  const innerWidth = ref(
    rootElement?.value
      ? rootElement.value?.getBoundingClientRect().width
      : window.innerWidth
  );

  const handleResize = throttle(() => {
    innerWidth.value = rootElement?.value
      ? rootElement.value?.getBoundingClientRect().width
      : window.innerWidth;
  }, 8);

  window.addEventListener('resize', handleResize);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    innerWidth,
    handleResize,
  };
}
