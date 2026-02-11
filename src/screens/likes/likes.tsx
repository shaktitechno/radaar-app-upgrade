import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import Colors from '../../constant/colors';
import {
  getUsersWhoLikedMe,
  getmyMatches,
  swipeUser,
} from '../../services/api';
import { commonStyle } from '../../constant/commonStyle';
import EmptyCard from '../../components/empatyCard';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import PopupModal from '../../components/noPlane';

import { useFocusEffect } from '@react-navigation/native';
import LikeSwipeCard from '../../components/LikeSwipeCard';

const Likes = ({ navigation, activeTabIndex }: any) => {
  const { userDetails: currentUserData, setUserDetails } =
    useContext(UserProfileData);
  const [loading, setLoading] = useState<boolean>(true);
  const [LikedData, setLikedData] = useState<Array<any>>([]);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [refresh, setRefreshing] = useState(false);
  const [index, setIndex] = useState<number>();

  const getData = (refresh?: boolean) => {
    getUsersWhoLikedMe({ page: refresh ? 1 : page })
      .then(res => {
        // console.log('refresh console ', page)
        if (refresh) {
          setPage(1);
          setRefreshing(false);
        }
        setTimeout(() => {
          setLoading(false);
        }, 800);
        setLikedData(res?.data?.users);
      })

      .catch(err => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (page == 1) {
      return;
    }
    getData(false);
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      getData(true);
    }, [activeTabIndex]),
  );

  const dislike = (id: string, type: string) => {
    if (
      !currentUserData?.subscription?.swipes ||
      currentUserData?.subscription?.swipes?.type == 'no_swipes' ||
      (currentUserData?.subscription?.swipes?.type == 'custom_swipes' &&
        currentUserData?.subscription?.swipes?.count <= 0)
    ) {
      setVisible(true);
      return;
    }
    if (currentUserData?.subscription?.swipes?.type == 'custom_swipes') {
      setUserDetails((oldstate: any) => {
        // console.log('setUserDetailsoldstateoldstate',oldstate)
        return {
          ...oldstate,
          subscription: {
            ...oldstate?.subscription,
            swipes: {
              ...oldstate?.subscription?.swipes,
              count: oldstate?.subscription?.swipes?.count
                ? oldstate?.subscription?.swipes?.count - 1
                : 0,
            },
          },
        };
      });
    }
    const data = {
      swipeDirection: type,
      swipeeUserId: id,
    };
    swipeUser(data)
      .then(res => {
        console.log('asdfasfd :', data);
        if (res.status) {
          setLikedData(state => state.filter(elm => elm._id != id));
        }
        // console.log('res.dataasd',res.data,data)
      })
      .catch(err => {
        // console.log('errerrerr',err)
        if (currentUserData?.subscription?.swipes?.type == 'custom_swipes') {
          setUserDetails((oldstate: any) => {
            // console.log('setUserDetailsoldstateoldstate',oldstate)
            return {
              ...oldstate,
              subscription: {
                ...oldstate?.subscription,
                swipes: {
                  ...oldstate?.subscription?.swipes,
                  count: oldstate?.subscription?.swipes?.count
                    ? oldstate?.subscription?.swipes?.count + 1
                    : 1,
                },
              },
            };
          });
        }
      });
  };
  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.white,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.row}>
              <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={LikedData?.length == 0 && { flex: 1 }}
                onRefresh={() => {
                  getData(true);
                  setRefreshing(true);
                }}
                refreshing={refresh}
                onEndReached={() => setPage(state => Number(state) + 1)}
                initialNumToRender={10}
                onEndReachedThreshold={0.9}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                keyExtractor={item => item._id}
                data={LikedData}
                renderItem={({ item: data, index: key }) => {
                  return (
                    <LikeSwipeCard
                      key={data._id}
                      {...{
                        dislike,
                        indexKey: key,
                        index,
                        data,
                        setIndex,
                        navigation,
                        setVisible,
                      }}
                    />
                  );
                }}
                ListEmptyComponent={() => (
                  <View style={commonStyle.center}>
                    <EmptyCard text="No Likes Yet" mydetails={undefined} />
                  </View>
                )}
              />
            </View>
          </View>
        </View>
        {loading && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                flex: 1,
                overflow: 'hidden',
                marginHorizontal: 5,
                backgroundColor: Colors.white,
              },
            ]}
          >
            <SkeletonPlaceholder borderRadius={10}>
              <SkeletonPlaceholder.Item
                style={{ flexDirection: 'row', flexWrap: 'wrap' }}
              >
                {Array(10)
                  .fill('')
                  .map((_, index) => {
                    return (
                      <SkeletonPlaceholder.Item
                        width={'50%'}
                        padding={10}
                        marginBottom={10}
                      >
                        <SkeletonPlaceholder.Item
                          style={{ margin: 0 }}
                          height={220}
                          width={'100%'}
                        />
                      </SkeletonPlaceholder.Item>
                    );
                  })}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
          </View>
        )}
        <PopupModal
          navigation={navigation}
          isVisible={visible}
          imgKey="Swipes"
          title={"You're killing it!"}
          subTitle={
            'Keep the pace going! \n You never know you might find match on next swipe 😉'
          }
          onClose={() => setVisible(false)}
        />
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  headerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    // borderBottomWidth: 1,
  },
  headerBtn: {
    height: 48,
    width: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  container: {
    paddingHorizontal: 15,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    // borderWidth:2,
    flex: 1,
  },
  row: {
    // flexDirection: 'row',
    // marginHorizontal: -10,
    // flexWrap: 'wrap',
    // borderWidth:1,
    flex: 1,
    marginTop: 20,
  },
  col33: {
    width: '33.33%',
    paddingHorizontal: 5,
  },
  col66: {
    width: '66.67%',
    paddingHorizontal: 5,
  },
  col50: {
    borderRadius: 10,
    width: '100%',
    // padding: 10,
    backgroundColor: Colors.white,
  },
  col100: {
    width: '100%',
    paddingHorizontal: 5,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: 'rgba(0,0,0,.5)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  standaloneRowBack: {
    alignItems: 'center',
    // backgroundColor: '#8BC645',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // padding: 15,
    // borderWidth
    // height:220
  },
  backTextWhite: {
    color: '#FFF',
  },
});
export default Likes;
