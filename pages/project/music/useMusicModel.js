import musicContext from './MusicContext'
import MusicModel from './MusicModel'
import useModel from '../../../scripts/useModel'

const useMusicModel = (hookkeys) => useModel(musicContext, MusicModel, hookkeys)

export default useMusicModel
