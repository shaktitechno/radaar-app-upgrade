import React from 'react';
import { Modal, StyleSheet, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Icon } from 'react-native-elements';
import { commonStyle } from '../constant/commonStyle';
import Colors from '../constant/colors';

interface FullScreenImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageUrl: string;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({ isVisible, onClose, imageUrl }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Image
          source={{uri:imageUrl}}
          style={styles.fullImage}
          resizeMode="contain"
        />
        <TouchableOpacity style={[commonStyle.backshadowButton,styles.closeButton]} onPress={onClose}>
          <Icon name="close" size={30} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding:10
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});

export default FullScreenImageModal;
