module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',
      viewportWidth: 1920,
      unitPrecision: 100,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: [/^#index/],
      minPixelValue: 0,
      mediaQuery: false,
      replace: true,
      exclude: [/datav/, /centerControl/],
      include: undefined,
      landscape: false,
      landscapeUnit: 'vh', // 横屏时使用的单位
      landscapeWidth: 1920 // 横屏时使用的视口宽度
    }
  }
}
