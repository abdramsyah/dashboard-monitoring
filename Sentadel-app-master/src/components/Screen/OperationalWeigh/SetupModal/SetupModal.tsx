import { TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Dropdown, {
  DropdownItemEnum
} from '@sentadell-src/components/Dropdown/Dropdown';
import CenteredModal from '@sentadell-src/components/Modals/ModalCenter/CenteredModal';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import styles from './SetupModal.styles';
import {
  portGroupOptions,
  serverQuantityOptions
} from '@sentadell-src/constants/weigh';
import {
  useGetScaleServer,
  useSetScaleServer
} from '@sentadell-src/stores/realm/actions/scaleServer';
import Input from '@sentadell-src/components/Form/Input/Input';
import { ScaleServerType } from '@sentadell-src/stores/realm/schemas/scaleServer';
import { RefreshSvg } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';

interface SetupModalProps {
  visible: boolean;
  onClose: () => void;
  onPreSubmit: () => void;
  onSubmit: () => void;
}

const SetupModal: React.FC<SetupModalProps> = (props: SetupModalProps) => {
  const { visible, onClose, onPreSubmit } = props;

  const scaleServer = useGetScaleServer();
  const setScaleServer = useSetScaleServer();

  const actualServerQuantityOptions = serverQuantityOptions.map(e => ({
    ...e,
    selected: scaleServer?.portList?.length === e[DropdownItemEnum.VALUE]
  }));

  const actualPortGroupOptions = portGroupOptions.map(e => ({
    ...e,
    selected: scaleServer?.portGroup === e[DropdownItemEnum.LABEL]
  }));
  const [data, setData] = useState<ScaleServerType>({
    host: '',
    portGroup: '',
    currPortIdx: 0,
    portList: []
  });

  const getCurrPort = (serv: ScaleServerType, index?: number) =>
    serv.host && serv.portGroup
      ? `${serv.portGroup.replaceAll('x', '')}${index || 0}`
      : '0';

  const getNewPortList = (valInt: number, newData?: ScaleServerType) => {
    const newPortList: number[] = [];

    for (let i = 0; i < valInt; i++) {
      newPortList.push(parseInt(getCurrPort(newData || data, i)));
    }

    return newPortList;
  };

  useEffect(() => {
    if (scaleServer) setData({ ...scaleServer });
  }, [scaleServer]);

  return (
    <CenteredModal
      visible={visible}
      customStyle={{
        container: styles.container
      }}
      onClose={onClose}>
      <TextBase.L>Filter</TextBase.L>
      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <Input
            outlined
            label="Host"
            inputProps={{
              value: data.host,
              onChangeText: text =>
                setData(state => {
                  state.host = text;

                  return { ...state };
                })
            }}
          />
          <Dropdown
            title="Kelompok Port"
            label="Kelompok Port"
            options={actualPortGroupOptions}
            onChange={val => {
              setData(state => {
                if (data?.portList?.length) {
                  const newPortList = getNewPortList(data.portList.length, {
                    ...data,
                    portGroup: val[DropdownItemEnum.LABEL]
                  });

                  state.portList = newPortList;
                }
                state.portGroup = val[DropdownItemEnum.LABEL];
                state.currPortIdx = 0;

                return { ...state };
              });
            }}
          />
          <Dropdown
            title="Jumlah port yang dibuka"
            label="Jumlah port yang dibuka"
            options={actualServerQuantityOptions}
            disabled={!data.portGroup}
            onChange={val => {
              setData(state => {
                const valInt = val[DropdownItemEnum.VALUE] as number;
                const newPortList = getNewPortList(valInt);

                state.portList = newPortList;
                state.currPortIdx = 0;

                return { ...state };
              });
            }}
          />
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <Input
              outlined
              customStyle={{
                container: flexiStyle.flex1
              }}
              label="Port aktif"
              inputProps={{
                editable: false,
                value:
                  data.portList[data.currPortIdx]?.toString() ||
                  getCurrPort(data) ||
                  '0'
              }}
            />
            <TouchableOpacity
              disabled={!scaleServer}
              onPress={() => {
                let nextPortIdx = 0;

                if (data.currPortIdx < data.portList.length - 1)
                  nextPortIdx = data.currPortIdx + 1;
                if (scaleServer) {
                  setScaleServer.update({
                    data: { ...data, currPortIdx: nextPortIdx },
                    obj: scaleServer
                  });
                }
              }}>
              <RefreshSvg
                stroke={
                  !scaleServer ? Colors.button.disabled : Colors.base.fullBlack
                }
              />
            </TouchableOpacity>
          </View>
          <View style={flexiStyle.flexRowG1}>
            <Button
              theme={'solid-blue'}
              title="Submit"
              customStyle={{
                container: flexiStyle.flex1
              }}
              onPress={() => {
                onPreSubmit();
                if (data) {
                  if (!scaleServer) {
                    setScaleServer.create(data);
                  } else {
                    setScaleServer.update({ data, obj: scaleServer });
                  }
                }
              }}
            />
          </View>
        </View>
      </View>
    </CenteredModal>
  );
};

export default SetupModal;
