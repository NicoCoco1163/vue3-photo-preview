<template>
  <teleport
    to="body"
    :disabled="!appendToBody"
  >
    <div
      v-if="photoVisible"
      ref="wrapperRef"
      :class="['PhotoSlider__Wrapper', {
        'PhotoSlider__Clean': showAnimateType !== ShowAnimateEnum.None ,
        'PhotoSlider__Hide': !overlayVisible,
        'NotFixed': !appendToBody,
      }]"
    >
      <div
        class="PhotoSlider__Backdrop"
        :class="{
          'PhotoSlider__fadeIn': showAnimateType === ShowAnimateEnum.In,
          'PhotoSlider__fadeOut': showAnimateType === ShowAnimateEnum.Out
        }"
        :style="{
          background: `rgba(0, 0, 0, ${backdropOpacity})`,
        }"
        @animationend="onShowAnimateEnd(), resetBackdropOpacity()"
      />
      <div
        v-if="appendToBody"
        class="PhotoSlider__BannerWrap TopRight"
      >
        <div class="PhotoSlider__Banner">
          <close
            class="PhotoSlider__BannerIcon"
            @click="handleClickClose"
          />
        </div>
      </div>
      <div
        v-if="!alwaysHideBannerRef"
        class="PhotoSlider__BannerWrap Bottom"
      >
        <!-- <div class="PhotoSlider__Counter">
          {{ index + 1 }} / {{ items.length }}
        </div> -->
        <div class="PhotoSlider__Banner">
          <full-screen
            class="PhotoSlider__BannerIcon"
            @click="handleFullScreen"
          />
          <original-size
            class="PhotoSlider__BannerIcon"
            @click="handleOriginalSize"
          />
          <download
            class="PhotoSlider__BannerIcon"
            @click="handleDownload"
          />
          <printer
            v-if="showPrinterIcon"
            class="PhotoSlider__BannerIcon Small"
            @click="handlePrint"
          />
          <rotate-right
            class="PhotoSlider__BannerIcon"
            @click="handleRotateRight"
          />
          <rotate-left
            class="PhotoSlider__BannerIcon"
            @click="handleRotateLeft"
          />
          <flip-horizontal
            class="PhotoSlider__BannerIcon"
            @click="toggleFlipHorizontal"
          />
          <flip-vertical
            class="PhotoSlider__BannerIcon"
            @click="toggleFlipVertical"
          />
          <zoom-in
            class="PhotoSlider__BannerIcon"
            @click="handleZoomIn"
          />
          <zoom-out
            class="PhotoSlider__BannerIcon"
            @click="handleZoomOut"
          />
          <div
            v-if="$slots.icon?.()"
            class="PhotoSlider__BannerIconExtra"
          >
            <slot name="icon" />
          </div>
        </div>
      </div>
      <div
        v-for="(item, currentIndex) in showItems"
        :key="item.key"
        class="PhotoSlider__PhotoBox"
        :style="{
          left: getItemLeft(currentIndex),
          transition: getItemTransition(),
          transform: getItemTransform()
        }"
        @transitionend="resetNeedTransition"
        @click="handleClickMask"
      >
        <photo-view
          :ref="(val) => setPhotoViewRef(item.key, val)"
          :origin-rect="originRect"
          :show-animate-type="showAnimateType"
          :src="item.src"
          @click.stop
          @touchStart="handleTouchStart"
          @touchMove="handleTouchMove"
          @touchEnd="handleTouchEnd"
          @singleTap="handleSingleTap"
        />
      </div>
      <template v-if="!isTouchDevice">
        <div
          v-if="loop || index > 0"
          class="PhotoSlider__ArrowLeft"
          :style="{
            left: overlayVisible ? `${thumbnailWidth}px` : '0'
          }"
          @click="handlePrevious"
        >
          <arrow-left />
        </div>
        <div
          v-if="loop || index < items.length - 1"
          class="PhotoSlider__ArrowRight"
          @click="handleNext"
        >
          <arrow-right />
        </div>
      </template>

      <!-- <div
        v-if="currentItem.intro"
        class="PhotoSlider__FooterWrap"
      >
        {{ currentItem.intro }}
      </div> -->

      <transition
        name="fade"
        mode="out-in"
        appear
      >
        <div
          v-if="Array.isArray($props.items) && ($props.items.length > 1) && overlayVisible"
          class="PhotoSlider__BannerWrap_NotHover Left"
          :style="{
            width: `${thumbnailWidth}px`
          }"
        >
          <photo-thumbnail
            :items="$props.items"
            :index="$props.index"
          />
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script lang='ts'>
import { defineComponent, computed, toRefs, PropType, inject, Ref, ref, onMounted } from 'vue';
import PhotoView from '../PhotoView/index.vue';
import { horizontalOffset, minSwitchImageOffset } from '../constant';
import useBodyEffect from './useBodyEffect';
import useInnerWidth from './useInnerWidth';
import Close from './Close.vue';
import ArrowLeft from './ArrowLeft.vue';
import ArrowRight from './ArrowRight.vue';
import RotateLeft from './RotateLeft.vue';
import RotateRight from './RotateRight.vue';
import FlipHorizontal from './FlipHorizontal.vue';
import FlipVertical from './FlipVertical.vue';
import Download from './Download.vue';
import FullScreen from './FullScreen.vue';
import OriginalSize from './OriginalSize.vue';
import ZoomIn from './ZoomIn.vue';
import ZoomOut from './ZoomOut.vue';
import Printer from './Printer.vue';
import PhotoThumbnail from '../PhotoThumbnail/index.vue';
import useAnimationHandle from './useAnimationHandle';
import { ItemType, ShowAnimateEnum, TouchTypeEnum, EdgeTypeEnum } from '../types';
import isTouchDevice from '../utils/isTouchDevice';
import { maxScale, scaleStep, thumbnailMaxWidth, thumbnailMinWidth } from '../constant';

export default defineComponent({
  name: 'PhotoSlider',
  components: {
    PhotoView,
    PhotoThumbnail,
    Close,
    ArrowLeft,
    ArrowRight,
    RotateLeft,
    RotateRight,
    FlipHorizontal,
    FlipVertical,
    Download,
    FullScreen,
    OriginalSize,
    ZoomIn,
    ZoomOut,
    Printer,
  },
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
    /**
     * 是否显示模态框
     */
    visible: {
      type: Boolean,
      required: true,
    },
    /**
     * 箭头切换是否需要过渡
     */
    shouldTransition: {
      type: Boolean,
      default: false,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    /**
     * 是否切换显隐覆盖物
     */
    toggleOverlay: {
      type: Boolean,
      default: true,
    },
    /**
     * 默认背景透明度
     */
    defaultBackdropOpacity: {
      type: Number,
      default: 1,
    },
    /**
     * 是否循环显示预览图
     */
    loop: {
      type: Boolean,
      default: false,
    },
    /**
     * 下载图片方法，不传使用内置的下载方法
     */
    onDownload: {
      type: Function as PropType<(item: ItemType) => void | null>,
      default: null,
    },
    /**
     * 打印方法，传入方法时显示图标
     */
     onPrint: {
      type: Function as PropType<(item: ItemType) => void | null>,
      default: null,
    }
  },
  emits: ['clickPhoto', 'clickMask', 'changeIndex', 'closeModal'],
  setup(props) {
    const wrapperRef = ref();
    const { items, index, visible } = toRefs(props);
    const currentItem = computed<ItemType>(() => {
      return items.value[index.value] || {};
    });

    useBodyEffect(visible);
    const {
      photoVisible, showAnimateType, originRect, onShowAnimateEnd
    } = useAnimationHandle(visible, currentItem);
    const { innerWidth, handleResize } = useInnerWidth(
      computed(() => !props.appendToBody && wrapperRef.value)
    );

    onMounted(handleResize);

    const thumbnailWidth = computed(() => {
      return Math.max(
        Math.min(
          Math.ceil(innerWidth.value / 4),
          thumbnailMaxWidth
        ),
        thumbnailMinWidth
      );
    });

    const alwaysHideBannerRef = inject<Ref<boolean>>('alwaysHideBanner');

    return {
      wrapperRef,
      innerWidth,
      thumbnailWidth,
      currentItem,
      photoVisible,
      showAnimateType,
      originRect,
      onShowAnimateEnd,
      alwaysHideBannerRef,
    };
  },
  data() {
    return {
      // 常量
      horizontalOffset,
      ShowAnimateEnum,
      isTouchDevice,
      // 触摸相关
      touched: false,
      hasMove: false,
      needTransition: false,
      clientX: 0,
      clientY: 0,
      touchMoveX: 0,
      backdropOpacity: this.defaultBackdropOpacity,
      // 是否显示覆盖物
      overlayVisible: true,
      // 虚拟下标，用于循环预览
      virtualIndex: 0,
      // photo-view 子组件
      photoViewRefs: {} as { [key: string]: InstanceType<typeof PhotoView> },
    };
  },
  computed: {
    // 当前显示的图片列表
    showItems() {
      const len = this.items.length;
      if (this.loop) {
        const connect = this.items.concat(this.items).concat(this.items);
        return connect.slice(len + this.index - 1, len + this.index + 2);
      }
      return this.items.slice(Math.max(this.index - 1, 0), Math.min(this.index + 2, len));
    },
    showPrinterIcon() {
      return (typeof this.onPrint === 'function') ||
        (typeof this.$photoPreview?.onPrint === 'function');
    }
  },
  created() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  beforeUpdate() {
    this.photoViewRefs = {};
  },
  methods: {
    defaultOnDownload(item: ItemType) {
      const paths = item.src.split('/');
      const name = paths[paths.length - 1];

      const img = new Image();
      img.setAttribute('crossOrigin', 'Anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context?.drawImage(img, 0, 0, img.width, img.height);
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = item.downloadName || name;
            a.href = url;
            a.dispatchEvent(new MouseEvent('click'));
            // 释放 createObjectURL 创建的内存对象（否则以 blob:http 开头的 url 可以到浏览器访问，多次创建内存会不断增大）
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = item.src + '?v=' + Date.now();
    },
    handleDownload() {
      const item = this.items[this.index];

      if (typeof this.onDownload === 'function') {
        this.onDownload(item);
      } else if (typeof this?.$photoPreview?.onDownload === 'function') {
        this.$photoPreview.onDownload(item);
      } else {
        this.defaultOnDownload(item);
      }
    },
    handlePrint() {
      const item = this.items[this.index];

      if (typeof this.onPrint === 'function') {
        this.onPrint(item);
      } else if (typeof this?.$photoPreview?.onPrint === 'function') {
        this.$photoPreview.onPrint(item);
      }
    },
    toggleFlipHorizontal() {
      this.photoViewRefs[this.currentItem.key]?.toggleFlipHorizontal();
    },
    toggleFlipVertical() {
      this.photoViewRefs[this.currentItem.key]?.toggleFlipVertical();
    },
    handleRotateLeft() {
      this.photoViewRefs[this.currentItem.key]?.handleRotateLeft();
    },
    handleRotateRight() {
      this.photoViewRefs[this.currentItem.key]?.handleRotateRight();
    },
    handleFullScreen() {
      const wrapperRef = this.$refs.wrapperRef as HTMLElement;

      if (wrapperRef) {
        const { width, height } = wrapperRef.getBoundingClientRect();
        const currentImage = this.photoViewRefs[this.currentItem.key];

        if (currentImage) {
          Object.assign(currentImage, {
            scale: width / currentImage.width,
            rotate: 0,
            x: 0,
            y: (currentImage.height / currentImage.width) > (height / width)
              ? (height - currentImage.height) / -2
              : 0,
          });
        }
      }
    },
    handleOriginalSize() {
      const currentImage = this.photoViewRefs[this.currentItem.key];

      if (currentImage) {
        Object.assign(currentImage, {
          scale: 1,
          rotate: 0,
          x: 0,
          y: 0,
        });
      }
    },
    handleZoomIn() {
      const currentImage = this.photoViewRefs[this.currentItem.key];

      if (currentImage?.scale) {
        const increment = (currentImage.scale % 1) < .2;
        const toScale = Math.ceil(currentImage.scale) + Number(increment) * scaleStep;

        currentImage.scale = Math.min(maxScale, toScale);
      }
    },
    handleZoomOut() {
      const currentImage = this.photoViewRefs[this.currentItem.key];

      if (currentImage?.scale) {
        const increment = (currentImage.scale % 1) < .8;
        const toScale = Math.floor(currentImage.scale) - Number(increment) * scaleStep;

        currentImage.scale = Math.max(toScale, 1);
      }
    },
    setPhotoViewRef(key: string, ref: InstanceType<typeof PhotoView>) {
      this.photoViewRefs[key] = ref;
    },
    handleKeyDown(e: KeyboardEvent) {
      if (this.visible) {
        switch (e.code) {
          case 'ArrowLeft':
            this.handlePrevious();
            break;
          case 'ArrowRight':
            this.handleNext();
            break;
          case 'Escape':
            this.handleClickClose();
            break;
        }
      }
    },
    handleSingleTap(_clientX: number, _clientY: number, e: MouseEvent | TouchEvent) {
      if (this.toggleOverlay) {
        this.overlayVisible = !this.overlayVisible;
      }
      this.$emit('clickPhoto', e);
    },
    handleTouchStart(clientX: number, clientY: number) {
      this.touched = true;
      this.needTransition = false;
      this.clientX = clientX;
      this.clientY = clientY;
    },
    handleTouchMove(touchType: TouchTypeEnum, clientX: number, clientY: number, lastScale: number, edgeTypes: EdgeTypeEnum[]) {
      if (touchType === TouchTypeEnum.Scale && lastScale !== 1) {
        this.handleTouchScaleMove(clientX, edgeTypes);
      }
      if (touchType === TouchTypeEnum.X) {
        this.handleTouchHorizontalMove(clientX);
      }
      if (touchType === TouchTypeEnum.Y) {
        this.handleTouchVerticalMove(clientX, clientY);
      }
    },
    handleTouchScaleMove(clientX: number, edgeTypes: EdgeTypeEnum[]) {
      let touchMoveX = clientX - this.clientX;
      if (
        (touchMoveX > 0 && edgeTypes.includes(EdgeTypeEnum.Left)) ||
        (touchMoveX < 0 && edgeTypes.includes(EdgeTypeEnum.Right))
      ) {
        this.handleTouchHorizontalMove(clientX);
      }
    },
    handleTouchHorizontalMove(clientX: number) {
      let touchMoveX = clientX - this.clientX;

      // 非循环模式下，第一张和最后一张超出时拖拽距离减半
      if (
        !this.loop &&
        ((this.index === 0 && touchMoveX > 0) || (this.index === this.items.length - 1 && touchMoveX < 0))
      ) {
        touchMoveX = touchMoveX / 2;
      }

      this.hasMove = clientX !== this.clientX;
      this.touchMoveX = touchMoveX;
    },
    handleTouchVerticalMove(clientX: number, clientY: number) {
      let touchMoveY = Math.abs(clientY - this.clientY);
      const opacity = Math.max(
        Math.min(this.defaultBackdropOpacity, this.defaultBackdropOpacity - touchMoveY / 100 / 4),
        0
      );

      this.hasMove = clientX !== this.clientX || clientY !== this.clientY;
      this.backdropOpacity = opacity;
    },
    handleTouchEnd(touchType: TouchTypeEnum, clientX: number, clientY: number, lastScale: number, edgeTypes: EdgeTypeEnum[]) {
      if (touchType === TouchTypeEnum.Scale && lastScale !== 1) {
        this.handleTouchScaleEnd(clientX, edgeTypes);
      }
      if (touchType === TouchTypeEnum.X) {
        this.handleTouchHorizontalEnd(clientX);
      }
      if (touchType === TouchTypeEnum.Y) {
        this.handleTouchVerticalEnd(clientY);
      }
      // 只要移动过，则需要动画过渡
      if (this.hasMove) {
        this.needTransition = true;
      }
      this.touched = false;
      this.hasMove = false;
      this.clientX = 0;
      this.clientY = 0;
      this.touchMoveX = 0;
    },
    handleTouchScaleEnd(clientX: number, edgeTypes: EdgeTypeEnum[]) {
      const offsetX = clientX - this.clientX;
      // 下一张
      if (offsetX < -minSwitchImageOffset && edgeTypes.includes(EdgeTypeEnum.Right)) {
        this.handleNext();
      }
      // 上一张
      if (offsetX > minSwitchImageOffset && edgeTypes.includes(EdgeTypeEnum.Left)) {
        this.handlePrevious();
      }
    },
    handleTouchHorizontalEnd(clientX: number) {
      const offsetX = clientX - this.clientX;
      // 下一张
      if (offsetX < -minSwitchImageOffset) {
        this.handleNext();
      }
      // 上一张
      if (offsetX > minSwitchImageOffset) {
        this.handlePrevious();
      }
    },
    handleTouchVerticalEnd(clientY: number) {
      const offsetY = clientY - this.clientY;

      if (Math.abs(offsetY) > window.innerHeight * 0.14) {
        this.$emit('closeModal');
      } else {
        this.resetBackdropOpacity();
      }
    },
    resetBackdropOpacity() {
      this.backdropOpacity = this.defaultBackdropOpacity;
    },
    resetNeedTransition() {
      this.needTransition = false;
    },
    handlePrevious() {
      const len = this.items.length;
      if (!this.loop && this.index === 0) return;
      this.$emit('changeIndex', (this.index + len - 1) % len);
      this.virtualIndex -= 1;
    },
    handleNext() {
      const len = this.items.length;
      if (!this.loop && this.index === len - 1) return;
      this.$emit('changeIndex', (this.index + 1) % len);
      this.virtualIndex += 1;
    },
    handleClickMask(e: MouseEvent | TouchEvent) {
      this.$emit('clickMask', e);
    },
    handleClickClose() {
      this.$emit('closeModal');
    },
    // 当预览下一张时，currentIndex 会从 1 变成 0，相当于左移一个单位，所以此时只需要右移一个单位的来平衡 transform 的左移即可
    getItemLeft(currentIndex: number) {
      let index = this.virtualIndex + currentIndex;
      // 非循环模式的第一张图片不需要左移，因为只有两张图片，左侧没有图片
      if (this.loop || this.index !== 0) {
        index -= 1;
      }
      return `${(this.innerWidth + this.horizontalOffset) * index}px`;
    },
    getItemTransition() {
      const transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
      if (this.needTransition) {
        return transition;
      }
      if (this.hasMove) {
        return undefined;
      }
      return this.shouldTransition ? transition : 'initial';
    },
    getItemTransform() {
      return `translate3d(${-(this.innerWidth + this.horizontalOffset) * this.virtualIndex + this.touchMoveX}px, 0px, 0px)`;
    }
  }
});
</script>

<style lang="scss">
@keyframes PhotoView__fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.PhotoSlider__Wrapper.PhotoSlider__Clean {
  .PhotoSlider__BannerWrap,
  .PhotoSlider__BannerWrap_NotHover,
  .PhotoSlider__ArrowLeft,
  .PhotoSlider__ArrowRight,
  .PhotoSlider__FooterWrap {
    opacity: 0;
    @media (any-hover: hover){
      &:hover {
        opacity: 0;
      }
    }
  }
}

.PhotoSlider__Wrapper.PhotoSlider__Hide {
  .PhotoSlider__BannerWrap,
  .PhotoSlider__BannerWrap_NotHover,
  .PhotoSlider__ArrowLeft,
  .PhotoSlider__ArrowRight,
  .PhotoSlider__FooterWrap {
    opacity: 0;
  }
  .PhotoSlider__BannerWrap_NotHover {
    z-index: 8 !important;
  }
}

.PhotoSlider__Wrapper {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2000;
  user-select: none;

  &.NotFixed {
    position: absolute;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .2s ease-out;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .PhotoSlider__Backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;

    &.PhotoSlider__fadeIn {
      opacity: 0;
      animation: PhotoView__fade 0.4s linear both;
    }
    &.PhotoSlider__fadeOut {
      opacity: 1;
      animation: PhotoView__fade 0.4s linear both reverse;
    }
  }

  .PhotoSlider__BannerWrap {
    position: absolute;
    font-size: 0;
    transition: opacity 0.2s ease-out;

    @media (any-hover: hover){
      &:hover {
        opacity: 1;
      }
    }
  }

  .PhotoSlider__BannerWrap.TopRight {
    top: 20px;
    right: 20px;
    z-index: 21;

    .PhotoSlider__BannerIcon {
      box-sizing: content-box;
      padding: 8px;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      fill: white;
      background: rgba(255, 255, 255, .3);
      cursor: pointer;
      opacity: .7;
      transition: opacity .2s linear;

      &:hover {
        opacity: 1;
      }
    }
  }

  .PhotoSlider__BannerWrap_NotHover {
    position: absolute;
    font-size: 0;
    transition: opacity 0.2s ease-out;
  }

  .PhotoSlider__BannerWrap_NotHover.Left {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 11;
  }

  .PhotoSlider__BannerWrap.Bottom {
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    z-index: 20;

    .PhotoSlider__Counter {
      padding: 0 10px;
      font-size: 14px;
      opacity: 0.75;
    }

    .PhotoSlider__Banner {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 3px;
      padding: 3px 12px;
      font-size: 14px;
      color: rgb(78, 89, 105);
      background-color: #FFF;
      box-shadow: 0 4px 10px #0000001a;

      .PhotoSlider__BannerIcon {
        vertical-align: top;
        box-sizing: content-box;
        padding: 10px 8px;
        opacity: 0.75;
        cursor: pointer;
        transition: all 0.2s linear;
        width: 1em;
        height: 1em;

        &.Small {
          width: calc(1em - 2px);
          height: calc(1em - 2px);
          padding: 11px 9px;
        }

        @media (any-hover: hover){
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .PhotoSlider__PhotoBox {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    overflow: hidden;
  }

  .PhotoSlider__ArrowLeft {
    left: 0;
  }

  .PhotoSlider__ArrowRight {
    right: 0;
  }

  .PhotoSlider__ArrowLeft,
  .PhotoSlider__ArrowRight {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0 auto 0;
    width: 72px;
    height: 100px;
    opacity: 0.7;
    z-index: 20;
    cursor: pointer;
    transition: opacity 0.2s linear;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (any-hover: hover){
      &:hover {
        opacity: 1;
      }
    }

    svg {
      box-sizing: content-box;
      padding: 8px;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      fill: white;
      background: rgba(255, 255, 255, .3);
    }
  }

  // .PhotoSlider__FooterWrap {
  //   position: absolute;
  //   left: 0;
  //   bottom: 0;
  //   box-sizing: border-box;
  //   width: 100%;
  //   min-height: 44px;
  //   padding: 10px;
  //   line-height: 1.5;
  //   font-size: 14px;
  //   text-align: justify;
  //   color: #ccc;
  //   background-color: rgba(0, 0, 0, 0.5);
  //   transition: opacity 0.2s ease-out;
  //   z-index: 20;

  //   @media (any-hover: hover){
  //     &:hover {
  //       opacity: 1;
  //     }
  //   }
  // }
}
</style>
