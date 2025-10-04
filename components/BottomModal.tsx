import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  enableDynamicSizing?: boolean;
};

export default function BottomModal({
  title,
  visible,
  onClose,
  children,
  snapPoints: customSnapPoints,
  enableDynamicSizing = true,
}: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    if (enableDynamicSizing) {
      return undefined;
    }
    return customSnapPoints || ["80%", "100%"];
  }, [customSnapPoints, enableDynamicSizing]);

  const initialIndex = visible ? 0 : -1;

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
    ),
    []
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={initialIndex}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheet}
      enableDynamicSizing={enableDynamicSizing}
    >
      <BottomSheetView
        style={
          enableDynamicSizing
            ? styles.dynamicContentContainer
            : styles.contentContainer
        }
      >
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dynamicContentContainer: {
    paddingHorizontal: 20,
  },
});
