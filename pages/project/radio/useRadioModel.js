import radioContext from './RadioContext'
import RadioModel from './RadioModel'
import useModel from '../../../scripts/useModel'

const useRadioModel = (hookkeys) => useModel(radioContext, RadioModel, hookkeys)

export default useRadioModel
