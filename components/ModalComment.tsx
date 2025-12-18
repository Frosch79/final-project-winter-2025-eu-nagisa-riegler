import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, HelperText, Modal, Text, TextInput } from 'react-native-paper';
import { colors } from '../constants/Colors';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';
import type { CommentWithUserName } from '../database/comments';
import type { User } from '../migrations/00000-createTableUsers';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  albumId: number;
  userId: User['id'];
  comments: CommentWithUserName[];
  onUpdateComment: () => void;
};

export default function ModalComment({
  visible,
  onDismiss,
  albumId,
  userId,
  comments,
  onUpdateComment,
}: Props) {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();
  const pressHandle = async (id: CommentWithUserName['id']) => {
    const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok || 'error' in data) {
      setIsError(true);
      setMessage(data ?? 'Error delete comment');
      return;
    }
    if ('error' in data) {
      setIsError(true);
      setMessage('Network error');
    }
    onUpdateComment();
  };
  const renderUserComments = ({ item }: { item: CommentWithUserName }) => {
    return (
      <View
        style={{
          alignSelf: 'center',
          paddingHorizontal: 16,
          borderRadius: 30,
          marginRight: spacing.lg,
        }}
      >
        <Button
          onPress={() =>
            router.navigate({
              pathname:
                userId === item.userId
                  ? '/(tabs)/(user)/user'
                  : '/(tabs)/(user)/[userId]',
              params: { userId: item.userId },
            })
          }
        >
          <Text style={{ ...typography.body, fontWeight: '500' }}>
            {item.name}
          </Text>
        </Button>

        <Text style={{ ...typography.body }}>{item.content}</Text>
        <Text>{dayjs(item.createdDate).format('YYYY-MM-DD-HH:mm')}</Text>
        {userId && userId === item.userId ? (
          <Button onPress={() => pressHandle(item.id)}>
            <Text style={{ color: colors.outline }}>Delete</Text>
          </Button>
        ) : null}
      </View>
    );
  };

  const commentHandle = async () => {
    if (!content || content === '') {
      setIsError(true);
      setMessage('Comment text is empty');
      return;
    }
    const response = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        albumId: albumId,
        content: content,
      }),
    });
    const data = await response.json();

    if (!response.ok || 'error' in data) {
      setIsError(true);
      setMessage(data ?? 'Error delete comment');
      return;
    }
    if ('error' in data) {
      setIsError(true);
      setMessage('Network error');
    }
    setContent('');
    onUpdateComment();
  };
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      style={{
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
        borderRadius: 30,
      }}
      contentContainerStyle={{
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: 8,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: 16,
          borderRadius: 30,
        }}
      >
        <Text style={{ ...typography.title, marginBottom: spacing.sm }}>
          Comments
        </Text>
        {comments.length > 0 ? (
          <FlatList data={comments} renderItem={renderUserComments} />
        ) : (
          <Text>No comments</Text>
        )}

        <TextInput
          label=""
          placeholder="comment here"
          value={content}
          onChangeText={(text) => setContent(text)}
        />
        <Button mode="contained" onPress={async () => await commentHandle()}>
          <Text> send comment</Text>
        </Button>
        {isError ? <HelperText type="error">{message}</HelperText> : null}
        <Button onPress={onDismiss} style={{ marginTop: spacing.sm }}>
          <Text>Close</Text>
        </Button>
      </View>
    </Modal>
  );
}
