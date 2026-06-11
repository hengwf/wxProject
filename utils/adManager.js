class AdManager {
  constructor() {
    this.bannerAd = null
    this.interstitialAd = null
    this.rewardedVideoAd = null
    this.bannerAdUnitId = 'adunit-你的Banner广告位ID'
    this.interstitialAdUnitId = 'adunit-你的插屏广告位ID'
    this.rewardedVideoAdUnitId = 'adunit-你的激励视频广告位ID'
    // 检查广告API是否可用
    this.isAdApiAvailable = {
      banner: typeof wx.createBannerAd === 'function',
      interstitial: typeof wx.createInterstitialAd === 'function',
      rewardedVideo: typeof wx.createRewardedVideoAd === 'function'
    }
  }

  initBannerAd(adUnitId) {
    if (adUnitId) {
      this.bannerAdUnitId = adUnitId
    }
    
    if (this.bannerAd) {
      return this.bannerAd
    }

    // 检查API是否可用
    if (!this.isAdApiAvailable.banner) {
      console.log('Banner广告API不可用（开发环境）')
      return null
    }

    try {
      this.bannerAd = wx.createBannerAd({
        adUnitId: this.bannerAdUnitId,
        style: {
          left: 0,
          top: 0,
          width: 750
        }
      })

      this.bannerAd.onError((err) => {
        console.error('Banner广告加载失败:', err)
      })

      this.bannerAd.onLoad(() => {
        console.log('Banner广告加载成功')
      })

      return this.bannerAd
    } catch (e) {
      console.error('创建Banner广告失败:', e)
      return null
    }
  }

  showBannerAd() {
    if (!this.isAdApiAvailable.banner) {
      console.log('Banner广告API不可用，跳过展示')
      return
    }
    if (this.bannerAd) {
      this.bannerAd.show().catch((err) => {
        console.error('Banner广告展示失败:', err)
      })
    }
  }

  hideBannerAd() {
    if (!this.isAdApiAvailable.banner) {
      return
    }
    if (this.bannerAd) {
      this.bannerAd.hide()
    }
  }

  destroyBannerAd() {
    if (!this.isAdApiAvailable.banner) {
      this.bannerAd = null
      return
    }
    if (this.bannerAd) {
      this.bannerAd.destroy()
      this.bannerAd = null
    }
  }

  initInterstitialAd(adUnitId) {
    if (adUnitId) {
      this.interstitialAdUnitId = adUnitId
    }
    
    if (this.interstitialAd) {
      return this.interstitialAd
    }

    if (!this.isAdApiAvailable.interstitial) {
      console.log('插屏广告API不可用（开发环境）')
      return null
    }

    try {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: this.interstitialAdUnitId
      })

      this.interstitialAd.onError((err) => {
        console.error('插屏广告加载失败:', err)
      })

      this.interstitialAd.onLoad(() => {
        console.log('插屏广告加载成功')
      })

      this.interstitialAd.onClose(() => {
        console.log('插屏广告关闭')
      })

      return this.interstitialAd
    } catch (e) {
      console.error('创建插屏广告失败:', e)
      return null
    }
  }

  showInterstitialAd() {
    if (!this.isAdApiAvailable.interstitial) {
      console.log('插屏广告API不可用，跳过展示')
      return
    }
    if (this.interstitialAd) {
      this.interstitialAd.show().catch((err) => {
        console.error('插屏广告展示失败:', err)
      })
    }
  }

  initRewardedVideoAd(adUnitId) {
    if (adUnitId) {
      this.rewardedVideoAdUnitId = adUnitId
    }
    
    if (this.rewardedVideoAd) {
      return this.rewardedVideoAd
    }

    if (!this.isAdApiAvailable.rewardedVideo) {
      console.log('激励视频广告API不可用（开发环境）')
      return null
    }

    try {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: this.rewardedVideoAdUnitId
      })

      this.rewardedVideoAd.onError((err) => {
        console.error('激励视频广告加载失败:', err)
      })

      this.rewardedVideoAd.onLoad(() => {
        console.log('激励视频广告加载成功')
      })

      return this.rewardedVideoAd
    } catch (e) {
      console.error('创建激励视频广告失败:', e)
      return null
    }
  }

  showRewardedVideoAd(onSuccess, onError) {
    if (!this.isAdApiAvailable.rewardedVideo) {
      console.log('激励视频广告API不可用，跳过展示')
      if (onError) onError('广告API不可用（开发环境）')
      return
    }
    if (!this.rewardedVideoAd) {
      if (onError) onError('广告未初始化')
      return
    }

    this.rewardedVideoAd.show().catch(() => {
      this.rewardedVideoAd.load().then(() => this.rewardedVideoAd.show()).catch((err) => {
        console.error('激励视频广告展示失败:', err)
        if (onError) onError(err)
      })
    })

    this.rewardedVideoAd.onClose((res) => {
      if (res && res.isEnded) {
        if (onSuccess) onSuccess()
      } else {
        if (onError) onError('未完整观看视频')
      }
    })
  }
}

const adManager = new AdManager()
module.exports = adManager
