import { useState } from 'react';
import { type GestureResponderEvent, SafeAreaView, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Portal,
  Text,
} from 'react-native-paper';
import { components } from '../constants/Components';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';
import type { FollowUser } from '../database/followers';
import type { FullUser } from '../database/users';
import ModalShowFollows from './ModalShowFollows';

type Props = {
  userData: FullUser;
  editOnPress:
    | (((event: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void))
    | undefined;
  homeOnPress:
    | (((event: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void))
    | undefined;
  followOnPress:
    | (((event: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void) &
        ((e: GestureResponderEvent) => void))
    | undefined;
  onSwitch: boolean;
  isFollow: boolean;
  followedUsersItem: FollowUser[];
  followerUsersItem: FollowUser[];
};
export default function UserCard(props: Props) {
  const [isFollowerModalVisible, setIsFollowerModalVisible] = useState(false);
  const [isFollowedModalVisible, setIsFollowedModalVisible] = useState(false);
  const [idSwitch, setIdSwitch] = useState('');

  const {
    userData,
    editOnPress,
    homeOnPress,
    followOnPress,
    onSwitch,
    isFollow,
    followedUsersItem,
    followerUsersItem,
  } = props;

  const leftContent = () => (
    <Avatar.Text size={40} label={userData.name[0] || '?'} />
  );
  return (
    <SafeAreaView>
      <Card
        style={{
          borderRadius: components.card.style.borderRadius,
          marginBottom: spacing.md,
        }}
      >
        {!onSwitch && (
          <Button
            onPress={homeOnPress}
            icon="home-variant"
            mode="text"
            style={{ margin: spacing.sm }}
            labelStyle={{ ...typography.button }}
          >
            Mypage
          </Button>
        )}
        <Card.Title
          title={userData.name || 'undefined'}
          subtitle={userData.accountDescription || ''}
          left={leftContent}
          titleStyle={{ ...typography.title }}
        />
        <Card.Content style={{ marginTop: spacing.sm }}>
          <Text
            style={{
              ...typography.body,
              marginBottom: spacing.sm,
            }}
          >
            Country: {userData.country || 'N/A'}
          </Text>

          {/* show follows */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: spacing.sm,
            }}
          >
            <Button
              mode="contained-tonal"
              onPress={() => {
                setIsFollowerModalVisible(true);
                setIdSwitch('follower');
              }}
              style={{
                flex: 1,
                marginRight: spacing.xs,
                borderRadius: components.button.borderRadius,
                paddingVertical: components.button.paddingVertical,
              }}
              labelStyle={{
                ...typography.button,

                textTransform: 'none',
              }}
              icon="account-group"
            >
              <Text>Follower ({followerUsersItem.length})</Text>
            </Button>

            <Button
              mode="contained-tonal"
              onPress={() => {
                setIsFollowedModalVisible(true);
                setIdSwitch('followed');
              }}
              style={{
                flex: 1,
                marginLeft: spacing.xs,
                borderRadius: components.button.borderRadius,
                paddingVertical: components.button.paddingVertical,
              }}
              labelStyle={{
                ...typography.button,

                textTransform: 'none',
              }}
              icon="account-multiple"
            >
              <Text>Followed ({followedUsersItem.length})</Text>
            </Button>
          </View>
        </Card.Content>
        <Card.Actions>
          {onSwitch && editOnPress ? (
            <IconButton icon="pen" onPress={editOnPress} />
          ) : (
            followOnPress && (
              <Button
                onPress={followOnPress}
                icon={isFollow ? 'account-minus' : 'account-plus-outline'}
                mode={isFollow ? 'outlined' : 'contained'}
                style={{
                  borderRadius: components.button.borderRadius,
                  paddingVertical: components.button.paddingVertical,
                }}
                labelStyle={{
                  ...typography.button,
                }}
              >
                {isFollow ? 'Followed' : 'Follow'}
              </Button>
            )
          )}
        </Card.Actions>
      </Card>
      {/* Modal */}
      <Portal>
        <ModalShowFollows
          //follower
          visible={isFollowerModalVisible}
          onDismiss={() => setIsFollowerModalVisible(false)}
          items={followerUsersItem}
          idSwitch={idSwitch}
          userId={userData.id}
        />
      </Portal>
      <Portal>
        <ModalShowFollows
          //followed
          visible={isFollowedModalVisible}
          onDismiss={() => setIsFollowedModalVisible(false)}
          items={followedUsersItem}
          idSwitch={idSwitch}
          userId={userData.id}
        />
      </Portal>
    </SafeAreaView>
  );
}
