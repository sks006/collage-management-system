import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { NoticeItem, CreateNoticeInput, INoticeHandlers } from "./notices.types";
import { noticeApi, NoticeApiService } from "./notices.api";

export function useNoticeSlice(api: NoticeApiService = noticeApi) {
  const { toast } = useToast();
  const [notices, setNotices] = React.useState<NoticeItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotices = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Notice Load Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  React.useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async (input: CreateNoticeInput): Promise<boolean> => {
    try {
      const created = await api.createNotice(input);
      setNotices((prev) => [created, ...prev]);
      toast({
        title: "Notice Broadcast Dispatched",
        description: `Published circular: "${input.titleEn}".`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Publication Error",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handlers: INoticeHandlers = {
    handleCreateNotice,
    handleRefresh: fetchNotices,
  };

  return {
    notices,
    loading,
    handlers,
  };
}
