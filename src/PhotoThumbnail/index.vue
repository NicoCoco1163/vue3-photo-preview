<template>
  <div class="PhotoThumbnail__Wrapper">
    <div
      v-for="(item, currentIndex) in items"
      :key="item.key"
      class="PhotoThumbnail__Box"
    >
      <div
        :class="['Wrap', {
          Selected: currentIndex === index
        }]"
        @click="clickOnThumbnail(currentIndex)"
      >
        <img
          :src="item.thumbnailSrc || item.src"
          :style="{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }"
        >
      </div>
      <p class="Intro">
        {{ item?.intro || getItemName(item.src) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject, toRefs } from 'vue';
import { updateIndexKey } from '../symbols';
import { ItemType } from '../types';

export default defineComponent({
  name: 'PhotoThumbnail',
  props: {
    /**
     * 图片列表
     */
     items: {
      type: Array as PropType<ItemType[]>,
      required: true,
    },
    /**
     * 图片当前索引
     */
     index: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { items, index } = toRefs(props);
    const updateIndex = inject(updateIndexKey);

    function getItemName(src: string | unknown) {
      if (typeof src === 'string') {
        return src.split('/').pop();
      }
      return src;
    }

    function clickOnThumbnail(toIndex: number) {
      if (toIndex !== index.value) {
        updateIndex?.(toIndex);
      }
    }

    return {
      getItemName,
      clickOnThumbnail
    };
  }
});
</script>

<style lang="scss">
.PhotoThumbnail {

  &__Wrapper {
    background-color: #FFF;
    padding: 20px 0;
    min-height: 100vh;
  }

  &__Box {
    width: 100%;
    box-sizing: border-box;
    padding: 0 20px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .Wrap {
      cursor: pointer;
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 130%;

      img {
        background-color: rgb(0, 0, 0);
        border-radius: 3px;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .Intro {
      color: rgb(78, 89, 105);
      font-size: 12px;
      line-height: 18px;
      margin: 4px 0 0;
      padding: 8px 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
      word-break: break-all;
    }

    .Selected {
      border-radius: 3px;
      border: 9px solid #EEE;
      box-sizing: content-box;
      margin: -9px;
    }
  }

}
</style>
